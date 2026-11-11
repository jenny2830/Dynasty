import Link from 'next/link'
import { Plus, RefreshCw, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Section, SectionHeader } from '@/components/ui/section'
import { formatCurrency } from '@/lib/utils'
import { getI18n } from '@/lib/i18n/server'
import { isRecurringPaymentPending } from '@/lib/recurring-utils'
import { RecurringPaymentRow } from './RecurringPaymentRow'
import { RecurringPaymentHistory } from '@/components/recurring/RecurringPaymentHistory'

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t('meta.recurring') }
}

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

  const [{ data: historyRows }, { data: propertyList }] = await Promise.all([
    supabase
      .from('transactions')
      .select('id, amount, category, transaction_date, description, property_id')
      .eq('landlord_id', landlord.id)
      .eq('source', 'recurring')
      .order('transaction_date', { ascending: false }),
    supabase
      .from('properties')
      .select('id, name')
      .eq('landlord_id', landlord.id)
      .eq('status', 'active')
      .order('name'),
  ])

  const propertyNameById = new Map((propertyList ?? []).map((p) => [p.id, p.name]))
  const history = (historyRows ?? []).map((row) => ({
    ...row,
    properties: row.property_id
      ? { name: propertyNameById.get(row.property_id) ?? '—' }
      : null,
  }))

  const active = (payments ?? []).filter((p) => p.is_active)
  const inactive = (payments ?? []).filter((p) => !p.is_active)

  const totalMonthly = active
    .filter((p) => p.frequency === 'monthly')
    .reduce((s, p) => s + p.amount, 0)

  const attentionPayments = active.filter((p) => {
    const reminderDays = (p as { reminder_days_before?: number | null }).reminder_days_before ?? 5
    return isRecurringPaymentPending(p, reminderDays)
  })

  const { t, locale } = await getI18n()

  return (
    <div className="space-y-7">
      <PageHeader
        title={t('recurring.title')}
        subtitle={t('recurring.subtitle', { active: active.length, amount: formatCurrency(totalMonthly, 'CAD', 2, locale) })}
      >
        <Button asChild>
          <Link href="/recurring/new">
            <Plus /> {t('recurring.add')}
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
          background: 'var(--badge-pos-bg)',
          border: '1px solid var(--badge-pos-border)',
          borderLeft: '3px solid var(--accent-c)',
        }}>
          <Bell size={16} strokeWidth={1.4} style={{ color: 'var(--accent-c)', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-c)',
              margin: '0 0 4px',
            }}>
              {attentionPayments.length === 1
                ? t('recurring.reminderOne')
                : t('recurring.reminderMany', { count: attentionPayments.length })}
            </p>
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              fontWeight: 400,
              color: 'var(--text-secondary-c)',
              margin: 0,
            }}>
              {t('recurring.markOnce', { names: attentionPayments.map((p) => p.name).join(', ') })}
            </p>
          </div>
        </div>
      )}

      {!payments?.length ? (
        <div
          className="flex flex-col items-center justify-center rounded-[2px] border border-dashed px-6 py-16 text-center"
          style={{ background: 'var(--section-bg)', borderColor: 'var(--card-border-color)' }}
        >
          <RefreshCw className="h-7 w-7" strokeWidth={1} style={{ color: 'var(--accent-c)', opacity: 0.15 }} />
          <h2
            className="mt-5 font-serif text-[22px] font-medium tracking-[0.04em]"
            style={{ color: 'var(--text-primary-c)' }}
          >
            {t('recurring.emptyTitle')}
          </h2>
          <p
            className="mt-2 max-w-sm font-sans text-[12px] font-light tracking-[0.06em]"
            style={{ color: 'var(--text-muted-c)' }}
          >
            {t('recurring.emptyBody')}
          </p>
          <Button asChild variant="outline" className="mt-7">
            <Link href="/recurring/new">
              <Plus /> {t('recurring.addFirst')}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-7">
          {active.length > 0 && (
            <Section>
              <SectionHeader title={t('recurring.activeCount', { count: active.length })} />
              <div className="divide-y" style={{ borderColor: 'var(--divider-c)' }}>
                {active.map((p) => (
                  <RecurringPaymentRow key={p.id} payment={p} />
                ))}
              </div>
            </Section>
          )}

          {inactive.length > 0 && (
            <Section className="opacity-60">
              <SectionHeader title={t('recurring.inactiveCount', { count: inactive.length })} />
              <div className="divide-y" style={{ borderColor: 'var(--divider-c)' }}>
                {inactive.map((p) => (
                  <RecurringPaymentRow key={p.id} payment={p} />
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      <RecurringPaymentHistory
        history={history}
        properties={propertyList ?? []}
      />
    </div>
  )
}
