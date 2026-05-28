'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { addWeeks, addMonths, addQuarters, addYears, format } from 'date-fns'

const recurringSchema = z.object({
  property_id: z.string().uuid('Property is required'),
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'annually']).default('monthly'),
  next_due_date: z.string().min(1, 'Due date is required'),
  reminder_days_before: z.coerce.number().int().min(0).max(30).default(5),
  auto_log_transaction: z.coerce.boolean().default(false),
  notes: z.string().optional().nullable(),
})

export type RecurringFormState = {
  errors?: Record<string, string[]>
  message?: string
} | null

async function getLandlordId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!landlord) throw new Error('Landlord profile not found')
  return { supabase, landlordId: landlord.id }
}

function advanceDate(current: string, frequency: string): string {
  const date = new Date(current)
  let next: Date
  switch (frequency) {
    case 'weekly':
      next = addWeeks(date, 1)
      break
    case 'quarterly':
      next = addQuarters(date, 1)
      break
    case 'annually':
      next = addYears(date, 1)
      break
    default:
      next = addMonths(date, 1)
  }
  return format(next, 'yyyy-MM-dd')
}

export async function createRecurringPayment(
  _prevState: RecurringFormState,
  formData: FormData
): Promise<RecurringFormState> {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let landlordId: string
  try {
    ;({ supabase, landlordId } = await getLandlordId())
  } catch (e) {
    return { errors: { _form: [(e as Error).message] } }
  }

  const raw = {
    property_id: formData.get('property_id'),
    name: formData.get('name'),
    category: formData.get('category'),
    amount: formData.get('amount'),
    frequency: formData.get('frequency') || 'monthly',
    next_due_date: formData.get('next_due_date'),
    reminder_days_before: formData.get('reminder_days_before') || '5',
    auto_log_transaction: formData.get('auto_log_transaction') === 'on',
    notes: formData.get('notes') || null,
  }

  const parsed = recurringSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { error } = await supabase.from('recurring_payments').insert({
    ...parsed.data,
    landlord_id: landlordId,
    is_active: true,
  })

  if (error) return { errors: { _form: [error.message] } }

  revalidatePath('/recurring')
  redirect('/recurring')
}

export async function updateRecurringPayment(
  id: string,
  _prevState: RecurringFormState,
  formData: FormData
): Promise<RecurringFormState> {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let landlordId: string
  try {
    ;({ supabase, landlordId } = await getLandlordId())
  } catch (e) {
    return { errors: { _form: [(e as Error).message] } }
  }

  const raw = {
    property_id: formData.get('property_id'),
    name: formData.get('name'),
    category: formData.get('category'),
    amount: formData.get('amount'),
    frequency: formData.get('frequency') || 'monthly',
    next_due_date: formData.get('next_due_date'),
    reminder_days_before: formData.get('reminder_days_before') || '5',
    auto_log_transaction: formData.get('auto_log_transaction') === 'on',
    notes: formData.get('notes') || null,
  }

  const parsed = recurringSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { error } = await supabase
    .from('recurring_payments')
    .update(parsed.data)
    .eq('id', id)
    .eq('landlord_id', landlordId)

  if (error) return { errors: { _form: [error.message] } }

  revalidatePath('/recurring')
  redirect('/recurring')
}

export async function markAsPaid(id: string): Promise<{ error?: string }> {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let landlordId: string
  try {
    ;({ supabase, landlordId } = await getLandlordId())
  } catch (e) {
    return { error: (e as Error).message }
  }

  const { data: payment, error: fetchError } = await supabase
    .from('recurring_payments')
    .select('*')
    .eq('id', id)
    .eq('landlord_id', landlordId)
    .single()

  if (fetchError || !payment) return { error: 'Payment not found' }

  const nextDue = advanceDate(payment.next_due_date, payment.frequency)

  const { error: updateError } = await supabase
    .from('recurring_payments')
    .update({ next_due_date: nextDue })
    .eq('id', id)

  if (updateError) return { error: updateError.message }

  // Auto-log transaction if enabled
  if (payment.auto_log_transaction) {
    await supabase.from('transactions').insert({
      landlord_id: landlordId,
      property_id: payment.property_id,
      type: 'expense',
      category: payment.category,
      amount: payment.amount,
      transaction_date: payment.next_due_date,
      description: payment.name,
      source: 'recurring',
    })
  }

  // Mark any pending reminders for this payment as paid
  await supabase
    .from('reminders')
    .update({ status: 'paid' })
    .eq('recurring_payment_id', id)
    .eq('status', 'pending')

  revalidatePath('/recurring')
  revalidatePath('/overview')
  return {}
}

export async function toggleRecurringActive(
  id: string,
  isActive: boolean
): Promise<{ error?: string }> {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let landlordId: string
  try {
    ;({ supabase, landlordId } = await getLandlordId())
  } catch (e) {
    return { error: (e as Error).message }
  }

  const { error } = await supabase
    .from('recurring_payments')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('landlord_id', landlordId)

  if (error) return { error: error.message }

  revalidatePath('/recurring')
  return {}
}

export async function deleteRecurringPayment(id: string): Promise<{ error?: string }> {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let landlordId: string
  try {
    ;({ supabase, landlordId } = await getLandlordId())
  } catch (e) {
    return { error: (e as Error).message }
  }

  const { error } = await supabase
    .from('recurring_payments')
    .delete()
    .eq('id', id)
    .eq('landlord_id', landlordId)

  if (error) return { error: error.message }

  revalidatePath('/recurring')
  return {}
}
