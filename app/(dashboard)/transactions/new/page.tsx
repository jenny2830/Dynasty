import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TransactionForm } from '@/components/transactions/TransactionForm'

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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/transactions"
          className="flex items-center gap-1.5 text-sm text-dynasty-gray-400 hover:text-dynasty-cream transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back to transactions
        </Link>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Add Transaction</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">
          Log an income or expense manually
        </p>
      </div>

      <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-6">
        <TransactionForm
          mode="create"
          properties={properties ?? []}
          defaultPropertyId={property_id}
        />
      </div>
    </div>
  )
}
