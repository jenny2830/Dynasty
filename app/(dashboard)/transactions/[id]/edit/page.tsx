import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { DeleteTransactionButton } from './DeleteTransactionButton'

export const metadata = { title: 'Edit Transaction' }

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!landlord) return null

  const [txResult, propertiesResult] = await Promise.all([
    supabase.from('transactions').select('*').eq('id', id).single(),
    supabase.from('properties').select('id, name').eq('landlord_id', landlord.id).order('name'),
  ])

  if (txResult.error || !txResult.data) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/transactions"
          className="flex items-center gap-1.5 text-sm text-dynasty-gray-400 hover:text-dynasty-cream transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back to transactions
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Edit Transaction</h1>
            <p className="mt-1 text-sm text-dynasty-gray-400">
              {txResult.data.description ?? txResult.data.category}
            </p>
          </div>
          <DeleteTransactionButton txId={id} />
        </div>
      </div>

      <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-6">
        <TransactionForm
          mode="edit"
          transaction={txResult.data}
          properties={propertiesResult.data ?? []}
        />
      </div>
    </div>
  )
}
