import Link from 'next/link'
import { Plus, RefreshCw, Bell } from 'lucide-react'
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
    .maybeSingle()
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

  // Compute attention items: overdue or due today (not already paid this period)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const attentionPayments = active.filter((p) => {
    const due = new Date(p.next_due_date)
    due.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    // Skip if already paid for this due date (paid record covers the cycle)
    if (p.last_paid_date) {
      const lp = new Date(p.last_paid_date)
      lp.setHours(0, 0, 0, 0)
      if (lp >= due) {
        return false
      }
    }
    const reminderDays = (p as { reminder_days_before?: number | null }).reminder_days_before ?? 5
    return diffDays <= reminderDays // includes overdue (negative) + today (0) + upcoming window
  })

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

      {/* Reminder banner — shown when payments need attention */}
      {attentionPayments.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '16px 20px',
          borderRadius: '2px',
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.22)',
          borderLeft: '3px solid #C9A84C',
        }}>
          <Bell size={16} strokeWidth={1.4} style={{ color: '#C9A84C', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              margin: '0 0 4px',
            }}>
              {attentionPayments.length === 1
                ? '1 Payment Reminder'
                : `${attentionPayments.length} Payment Reminders`}
            </p>
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              fontWeight: 400,
              color: 'var(--text-secondary-c)',
              margin: 0,
            }}>
              {attentionPayments.map((p) => p.name).join(', ')} — mark as paid once completed.
            </p>
          </div>
        </div>
      )}

      {!payments?.length ? (
        <div
          className="flex min-h-[50vh] flex-col items-center justify-center rounded-[2px] border border-dashed px-6 py-16 text-center"
          style={{ background: 'var(--section-bg)', borderColor: 'var(--card-border-color)' }}
        >
          <RefreshCw className="h-7 w-7" strokeWidth={1} style={{ color: 'var(--accent-c)', opacity: 0.15 }} />
          <h2
            className="mt-5 font-serif text-[22px] font-medium tracking-[0.04em]"
            style={{ color: 'var(--text-primary-c)' }}
          >
            No recurring payments
          </h2>
          <p
            className="mt-2 max-w-sm font-sans text-[12px] font-light tracking-[0.06em]"
            style={{ color: 'var(--text-muted-c)' }}
          >
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
              <div className="divide-y" style={{ borderColor: 'var(--divider-c)' }}>
                {active.map((p) => (
                  <RecurringPaymentRow key={p.id} payment={p} />
                ))}
              </div>
            </Section>
          )}

          {inactive.length > 0 && (
            <Section className="opacity-60">
              <SectionHeader title={`Inactive (${inactive.length})`} />
              <div className="divide-y" style={{ borderColor: 'var(--divider-c)' }}>
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
