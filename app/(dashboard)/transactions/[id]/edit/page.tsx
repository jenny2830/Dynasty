import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { DeleteTransactionButton } from './DeleteTransactionButton'
import { PageHeader } from '@/components/ui/page-header'

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
    <div className="mx-auto max-w-2xl space-y-7">
      <Link
        href="/transactions"
        className="inline-flex items-center gap-1.5 font-sans text-[10px] font-light uppercase tracking-[0.18em] text-dynasty-gray-400 transition-colors hover:text-dynasty-gold"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.2} /> Back to Transactions
      </Link>

      <PageHeader
        title="Edit Transaction"
        subtitle={txResult.data.description ?? txResult.data.category}
      >
        <DeleteTransactionButton txId={id} />
      </PageHeader>

      <div className="rounded-[2px] border border-[rgba(201,168,76,0.08)] bg-dynasty-black-soft px-9 py-9 shadow-[var(--shadow-card)]">
        <TransactionForm
          mode="edit"
          transaction={txResult.data}
          properties={propertiesResult.data ?? []}
        />
      </div>
    </div>
  )
}
