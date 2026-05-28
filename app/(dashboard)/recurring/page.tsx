import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { RecurringPaymentRow } from './RecurringPaymentRow'

export const metadata = { title: 'Recurring Payments' }

export default async function RecurringPage() {
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

  const { data: payments } = await supabase
    .from('recurring_payments')
    .select('*, properties(name)')
    .eq('landlord_id', landlord.id)
    .order('next_due_date', { ascending: true })

  const active = (payments ?? []).filter((p) => p.is_active)
  const inactive = (payments ?? []).filter((p) => !p.is_active)

  const totalMonthly = active
    .filter((p) => p.frequency === 'monthly')
    .reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">
            Recurring Payments
          </h1>
          <p className="mt-1 text-sm text-dynasty-gray-400">
            {active.length} active · {formatCurrency(totalMonthly)}/mo committed
          </p>
        </div>
        <Button asChild>
          <Link href="/recurring/new">
            <Plus className="h-4 w-4" /> Add Payment
          </Link>
        </Button>
      </div>

      {!payments?.length ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] rounded-xl border border-dashed border-dynasty-gray-700">
          <h2 className="font-serif text-xl text-dynasty-cream mb-2">No recurring payments</h2>
          <p className="text-sm text-dynasty-gray-400 mb-6 text-center max-w-sm">
            Set up recurring payments for mortgage, insurance, taxes, and other regular expenses.
          </p>
          <Button asChild>
            <Link href="/recurring/new">
              <Plus className="h-4 w-4" /> Add first payment
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 overflow-hidden">
              <div className="border-b border-dynasty-gray-700 px-6 py-4">
                <h2 className="font-serif text-lg font-semibold text-dynasty-cream">
                  Active ({active.length})
                </h2>
              </div>
              <div className="divide-y divide-dynasty-gray-800">
                {active.map((p) => (
                  <RecurringPaymentRow key={p.id} payment={p} />
                ))}
              </div>
            </div>
          )}

          {inactive.length > 0 && (
            <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 overflow-hidden opacity-60">
              <div className="border-b border-dynasty-gray-700 px-6 py-4">
                <h2 className="font-serif text-lg font-semibold text-dynasty-gray-400">
                  Inactive ({inactive.length})
                </h2>
              </div>
              <div className="divide-y divide-dynasty-gray-800">
                {inactive.map((p) => (
                  <RecurringPaymentRow key={p.id} payment={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
