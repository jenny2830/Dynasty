import Link from 'next/link'
import { Plus, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Section, SectionHeader } from '@/components/ui/section'
import { formatCurrency } from '@/lib/utils'
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
    <div className="space-y-7">
      <PageHeader
        title="Recurring Payments"
        subtitle={`${active.length} active · ${formatCurrency(totalMonthly)}/mo committed`}
      >
        <Button asChild>
          <Link href="/recurring/new">
            <Plus /> Add Payment
          </Link>
        </Button>
      </PageHeader>

      {!payments?.length ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-[2px] border border-dashed border-[rgba(201,168,76,0.18)] bg-dynasty-gray-900/40 px-6 py-16 text-center">
          <RefreshCw className="h-7 w-7 text-dynasty-gold/15" strokeWidth={1} />
          <h2 className="mt-5 font-serif text-[22px] font-medium tracking-[0.04em] text-dynasty-gray-300">
            No recurring payments
          </h2>
          <p className="mt-2 max-w-sm font-sans text-[12px] font-light tracking-[0.06em] text-dynasty-gray-500">
            Set up recurring payments for mortgage, insurance, taxes, and other regular expenses.
          </p>
          <Button asChild variant="outline" className="mt-7">
            <Link href="/recurring/new">
              <Plus /> Add First Payment
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-7">
          {active.length > 0 && (
            <Section>
              <SectionHeader title={`Active (${active.length})`} />
              <div className="divide-y divide-[rgba(255,255,255,0.025)]">
                {active.map((p) => (
                  <RecurringPaymentRow key={p.id} payment={p} />
                ))}
              </div>
            </Section>
          )}

          {inactive.length > 0 && (
            <Section className="opacity-60">
              <SectionHeader title={`Inactive (${inactive.length})`} />
              <div className="divide-y divide-[rgba(255,255,255,0.025)]">
                {inactive.map((p) => (
                  <RecurringPaymentRow key={p.id} payment={p} />
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  )
}
