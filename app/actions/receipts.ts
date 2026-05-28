'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ConfirmReceiptData {
  receiptId: string
  vendorName: string | null
  amount: number
  receiptDate: string
  category: string
  description: string | null
  propertyId: string | null
}

export async function confirmReceipt(
  data: ConfirmReceiptData
): Promise<{ error?: string; transactionId?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!landlord) return { error: 'Landlord profile not found' }

  // Update receipt to confirmed
  const { error: receiptError } = await supabase
    .from('receipts')
    .update({
      status: 'confirmed',
      vendor_name: data.vendorName,
      amount: data.amount,
      receipt_date: data.receiptDate,
      category: data.category,
      description: data.description,
      property_id: data.propertyId,
    })
    .eq('id', data.receiptId)
    .eq('landlord_id', landlord.id)

  if (receiptError) return { error: receiptError.message }

  // Create linked transaction
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      landlord_id: landlord.id,
      property_id: data.propertyId,
      type: 'expense',
      category: data.category,
      amount: data.amount,
      transaction_date: data.receiptDate,
      description: data.vendorName
        ? `${data.vendorName}${data.description ? ` — ${data.description}` : ''}`
        : (data.description ?? 'Receipt scan'),
      source: 'receipt_scan',
      receipt_id: data.receiptId,
      is_tax_deductible: false,
    })
    .select('id')
    .single()

  if (txError) return { error: txError.message }

  revalidatePath('/receipts')
  revalidatePath('/transactions')
  revalidatePath('/overview')

  return { transactionId: tx.id }
}

export async function rejectReceipt(receiptId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!landlord) return { error: 'Profile not found' }

  const { error } = await supabase
    .from('receipts')
    .update({ status: 'rejected' })
    .eq('id', receiptId)
    .eq('landlord_id', landlord.id)

  if (error) return { error: error.message }

  revalidatePath('/receipts')
  return {}
}
