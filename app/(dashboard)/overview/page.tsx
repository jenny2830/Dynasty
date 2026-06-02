import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart'
import { formatDate } from '@/lib/utils'
import { Building2, Plus, ArrowRight, Bell } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { Section, SectionHeader } from '@/components/ui/section'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'

export const metadata = { title: 'Overview' }

function buildChartData(
  transactions: { type: string; amount: number; transaction_date: string }[],
  months: Date[]
) {
  return months.map((monthDate) => {
    const monthKey = format(monthDate, 'yyyy-MM')
    const monthTxs = transactions.filter((t) =>
      t.transaction_date.startsWith(monthKey)
    )
    return {
      month: format(monthDate, 'MMM'),
      income: monthTxs
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0),
      expenses: monthTxs
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0),
    }
  })
}

export default async function OverviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id, full_name, plan')
    .eq('auth_user_id', user.id)
    .single()

  if (!landlord) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-sans text-[11px] font-normal uppercase tracking-[0.3em] text-dynasty-gold/60">
          Welcome
        </p>
        <h1 className="mt-3 font-serif text-[40px] font-semibold tracking-[0.04em] text-dynasty-warm-white">
          To Your Dynasty
        </h1>
        <div className="mx-auto mt-4 h-px w-12 bg-dynasty-gold/50" />
        <p className="mt-5 max-w-md font-sans text-[15px] font-normal text-dynasty-gray-400">
          Complete your profile to begin managing your portfolio.
        </p>
        <Button asChild className="mt-7">
          <Link href="/settings">Set Up Profile</Link>
        </Button>
      </div>
    )
  }

  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const sixMonthsAgo = format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd')

  const [
    propertiesResult,
    recentTxResult,
    monthlyTxResult,
    chartTxResult,
    remindersResult,
  ] = await Promise.all([
    supabase
      .from('properties')
      .select('id, name, city, province, status, current_value, type')
      .eq('landlord_id', landlord.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('transactions')
      .select('id, type, amount, category, transaction_date, description')
      .eq('landlord_id', landlord.id)
      .order('transaction_date', { ascending: false })
      .limit(5),
    supabase
      .from('transactions')
      .select('type, amount')
      .eq('landlord_id', landlord.id)
      .gte('transaction_date', monthStart)
      .lte('transaction_date', monthEnd),
    supabase
      .from('transactions')
      .select('type, amount, transaction_date')
      .eq('landlord_id', landlord.id)
      .gte('transaction_date', sixMonthsAgo)
      .order('transaction_date', { ascending: true }),
    supabase
      .from('reminders')
      .select('id, due_date, recurring_payments(name, amount)')
      .eq('landlord_id', landlord.id)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(4),
  ])

  const properties = propertiesResult.data ?? []
  const recentTx = recentTxResult.data ?? []
  const monthlyTx = monthlyTxResult.data ?? []
  const chartTx = chartTxResult.data ?? []
  const reminders = remindersResult.data ?? []

  const { data: allActiveProps } = await supabase
    .from('properties')
    .select('current_value')
    .eq('landlord_id', landlord.id)
    .eq('status', 'active')

  const totalValue = (allActiveProps ?? []).reduce((s, p) => s + (p.current_value ?? 0), 0)
  const activeCount = allActiveProps?.length ?? 0

  const monthlyIncome = monthlyTx
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const monthlyExpenses = monthlyTx
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  const monthlyNetIncome = monthlyIncome - monthlyExpenses

  const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i))
  const chartData = buildChartData(chartTx, months)

  const firstName = landlord.full_name.split(' ')[0]
  const hour = now.getHours()
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="space-y-9">
      {/* Header */}
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle={now.toLocaleDateString('en-CA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      >
        <Button asChild variant="outline" size="sm">
          <Link href="/transactions/new">
            <Plus /> Transaction
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/properties/new">
            <Plus /> Property
          </Link>
        </Button>
      </PageHeader>

      {/* Stats */}
      <StatsCards
        totalPortfolioValue={totalValue}
        monthlyNetIncome={monthlyNetIncome}
        activeProperties={activeCount}
        pendingReminders={reminders.length}
      />

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Income vs Expense chart — 3/5 width */}
        <Section className="lg:col-span-3">
          <SectionHeader
            title="Income vs Expenses"
            description="Last six months"
          />
          <div className="px-5 py-5">
            <IncomeExpenseChart data={chartData} />
          </div>
        </Section>

        {/* Recent transactions — 2/5 width */}
        <Section className="lg:col-span-2">
          <SectionHeader
            title="Recent Transactions"
            action={
              <Link
                href="/transactions"
                className="flex items-center gap-1.5 font-sans text-[12px] font-normal uppercase tracking-[0.18em] text-dynasty-gold transition-colors hover:text-dynasty-gold-light"
              >
                View All <ArrowRight className="h-3 w-3" strokeWidth={1.2} />
              </Link>
            }
          />
          <div className="divide-y divide-[rgba(255,255,255,0.025)]">
            {recentTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <p className="mb-3 font-sans text-[12px] tracking-[0.4em] text-[rgba(201,168,76,0.3)]">
                  ◆ ◇ ◆
                </p>
                <p className="font-serif text-[20px] font-medium text-dynasty-gray-400">
                  No transactions yet
                </p>
                <p className="mt-1 font-sans text-[14px] font-normal tracking-[0.06em] text-dynasty-gray-600">
                  Your ledger awaits its first entry
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/transactions/new">Add First</Link>
                </Button>
              </div>
            ) : (
              recentTx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-7 py-3.5 transition-colors hover:bg-[rgba(201,168,76,0.025)]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[15px] font-normal text-dynasty-warm-white">
                      {tx.description ?? tx.category}
                    </p>
                    <p className="mt-0.5 font-sans text-[13px] font-normal text-dynasty-gray-500">
                      {formatDate(tx.transaction_date)}
                    </p>
                  </div>
                  <span
                    style={{
                      marginLeft: '12px',
                      flexShrink: 0,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '15px',
                      fontWeight: 500,
                      letterSpacing: '-0.025em',
                      color: tx.type === 'income' ? '#C9A84C' : '#B76E79',
                    }}
                  >
                    {tx.type === 'income' ? '+' : '−'}$
                    {tx.amount.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Section>
      </div>

      {/* Properties + Reminders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section>
          <SectionHeader
            title="Properties"
            action={
              <Link
                href="/properties"
                className="flex items-center gap-1.5 font-sans text-[12px] font-normal uppercase tracking-[0.18em] text-dynasty-gold transition-colors hover:text-dynasty-gold-light"
              >
                View All <ArrowRight className="h-3 w-3" strokeWidth={1.2} />
              </Link>
            }
          />
          <div className="divide-y divide-[rgba(255,255,255,0.025)]">
            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <p className="mb-3 font-sans text-[12px] tracking-[0.4em] text-[rgba(201,168,76,0.3)]">
                  ◆ ◇ ◆
                </p>
                <Building2
                  className="h-9 w-9 text-[rgba(201,168,76,0.2)]"
                  strokeWidth={1}
                />
                <p className="mt-3 font-serif text-[20px] font-medium text-dynasty-gray-400">
                  No properties yet
                </p>
                <p className="mt-1 font-sans text-[14px] font-normal tracking-[0.06em] text-dynasty-gray-600">
                  Begin building your portfolio
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/properties/new">Add Property</Link>
                </Button>
              </div>
            ) : (
              properties.map((p) => (
                <Link
                  key={p.id}
                  href={`/properties/${p.id}`}
                  className="flex items-center justify-between px-7 py-4 transition-colors hover:bg-[rgba(201,168,76,0.025)]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[15px] text-dynasty-warm-white">
                      {p.name}
                    </p>
                    <p className="mt-0.5 font-sans text-[13px] font-normal text-dynasty-gray-500">
                      {p.city}, {p.province}
                    </p>
                  </div>
                  <Badge className="ml-4 shrink-0">{p.type}</Badge>
                </Link>
              ))
            )}
          </div>
        </Section>

        <Section>
          <SectionHeader
            title="Upcoming Reminders"
            action={
              <Link
                href="/recurring"
                className="flex items-center gap-1.5 font-sans text-[12px] font-normal uppercase tracking-[0.18em] text-dynasty-gold transition-colors hover:text-dynasty-gold-light"
              >
                View All <ArrowRight className="h-3 w-3" strokeWidth={1.2} />
              </Link>
            }
          />
          <div className="divide-y divide-[rgba(255,255,255,0.025)]">
            {reminders.length === 0 ? (
              <div className="flex items-center gap-3 px-7 py-5">
                <Bell className="h-4 w-4 shrink-0 text-dynasty-gold" strokeWidth={1.2} />
                <p className="font-sans text-[14px] font-normal tracking-[0.04em] text-dynasty-gray-400">
                  All clear — no pending reminders
                </p>
              </div>
            ) : (
              reminders.map((r) => {
                const payment = r.recurring_payments as { name: string; amount: number } | null
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-7 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-sans text-[15px] text-dynasty-warm-white">
                        {payment?.name ?? 'Payment due'}
                      </p>
                      <p className="mt-0.5 font-sans text-[13px] font-normal text-dynasty-gray-500">
                        Due {formatDate(r.due_date)}
                      </p>
                    </div>
                    {payment?.amount && (
                      <span style={{
                        marginLeft: '12px',
                        flexShrink: 0,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '15px',
                        fontWeight: 500,
                        letterSpacing: '-0.025em',
                        color: '#C9A84C',
                      }}>
                        ${payment.amount.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Section>
      </div>
    </div>
  )
}
