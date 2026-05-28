'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const txSchema = z.object({
  property_id: z.string().uuid().optional().nullable(),
  unit_id: z.string().uuid().optional().nullable(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  transaction_date: z.string().min(1, 'Date is required'),
  description: z.string().optional().nullable(),
  is_tax_deductible: z.coerce.boolean().default(false),
  source: z.enum(['manual', 'receipt_scan', 'recurring']).default('manual'),
})

export type TxFormState = {
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

export async function createTransaction(
  _prevState: TxFormState,
  formData: FormData
): Promise<TxFormState> {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let landlordId: string
  try {
    ;({ supabase, landlordId } = await getLandlordId())
  } catch (e) {
    return { errors: { _form: [(e as Error).message] } }
  }

  const raw = {
    property_id: formData.get('property_id') || null,
    unit_id: formData.get('unit_id') || null,
    type: formData.get('type'),
    category: formData.get('category'),
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description') || null,
    is_tax_deductible: formData.get('is_tax_deductible') === 'on',
    source: 'manual' as const,
  }

  const parsed = txSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { error } = await supabase.from('transactions').insert({
    ...parsed.data,
    landlord_id: landlordId,
  })

  if (error) return { errors: { _form: [error.message] } }

  revalidatePath('/transactions')
  revalidatePath('/overview')
  redirect('/transactions')
}

export async function updateTransaction(
  txId: string,
  _prevState: TxFormState,
  formData: FormData
): Promise<TxFormState> {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let landlordId: string
  try {
    ;({ supabase, landlordId } = await getLandlordId())
  } catch (e) {
    return { errors: { _form: [(e as Error).message] } }
  }

  const raw = {
    property_id: formData.get('property_id') || null,
    unit_id: formData.get('unit_id') || null,
    type: formData.get('type'),
    category: formData.get('category'),
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description') || null,
    is_tax_deductible: formData.get('is_tax_deductible') === 'on',
  }

  const parsed = txSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { error } = await supabase
    .from('transactions')
    .update(parsed.data)
    .eq('id', txId)
    .eq('landlord_id', landlordId)

  if (error) return { errors: { _form: [error.message] } }

  revalidatePath('/transactions')
  revalidatePath('/overview')
  redirect('/transactions')
}

export async function deleteTransaction(txId: string): Promise<{ error?: string }> {
  let supabase: Awaited<ReturnType<typeof createClient>>
  let landlordId: string
  try {
    ;({ supabase, landlordId } = await getLandlordId())
  } catch (e) {
    return { error: (e as Error).message }
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', txId)
    .eq('landlord_id', landlordId)

  if (error) return { error: error.message }

  revalidatePath('/transactions')
  revalidatePath('/overview')
  return {}
}
