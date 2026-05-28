import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = { title: 'Add Transaction' }

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ property_id?: string }>
}) {
  const { property_id } = await searchParams
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

  const { data: properties } = landlord
    ? await supabase
        .from('properties')
        .select('id, name')
        .eq('landlord_id', landlord.id)
        .order('name')
    : { data: [] }

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <Link
        href="/transactions"
        className="inline-flex items-center gap-1.5 font-sans text-[10px] font-light uppercase tracking-[0.18em] text-dynasty-gray-400 transition-colors hover:text-dynasty-gold"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.2} /> Back to Transactions
      </Link>

      <PageHeader title="Add Transaction" subtitle="Record income or expense" />

      <div className="rounded-[2px] border border-[rgba(201,168,76,0.08)] bg-dynasty-black-soft px-9 py-9 shadow-[var(--shadow-card)]">
        <TransactionForm
          mode="create"
          properties={properties ?? []}
          defaultPropertyId={property_id}
        />
      </div>
    </div>
  )
}
