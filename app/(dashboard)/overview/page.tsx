import { createClient } from '@/lib/supabase/server'
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard'
import { isRecurringPaymentPending } from '@/lib/recurring-utils'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'

export const dynamic = 'force-dynamic'
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
    .select('id, full_name, plan, display_currency')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  // No landlord record yet — show the dashboard with empty state rather than
  // blocking the user with a welcome/onboarding wall.
  if (!landlord) {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i))
    const hour = now.getHours()
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
    return (
      <OverviewDashboard
        greeting={`${greeting}, there`}
        dateSubtitle={now.toLocaleDateString('en-CA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        initialDisplayCurrency="CAD"
        totalPortfolioValue={0}
        monthlyNetIncome={0}
        activeProperties={0}
        pendingReminders={0}
        chartData={buildChartData([], months)}
        recentTx={[]}
        properties={[]}
        upcomingReminders={[]}
      />
    )
  }

  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
  const sixMonthsAgo = format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd')
  const sevenDaysFromNow = format(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
    'yyyy-MM-dd',
  )

  const [
    propertiesResult,
    recentTxResult,
    incomeResult,
    expenseResult,
    chartTxResult,
    pendingPaymentsResult,
    portfolioResult,
    activeCountResult,
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
      .select('amount')
      .eq('landlord_id', landlord.id)
      .eq('type', 'income')
      .gte('transaction_date', monthStart)
      .lte('transaction_date', monthEnd),
    supabase
      .from('transactions')
      .select('amount')
      .eq('landlord_id', landlord.id)
      .eq('type', 'expense')
      .gte('transaction_date', monthStart)
      .lte('transaction_date', monthEnd),
    supabase
      .from('transactions')
      .select('type, amount, transaction_date')
      .eq('landlord_id', landlord.id)
      .gte('transaction_date', sixMonthsAgo)
      .order('transaction_date', { ascending: true }),
    supabase
      .from('recurring_payments')
      .select('id, name, amount, next_due_date, last_paid_date, is_active')
      .eq('landlord_id', landlord.id)
      .eq('is_active', true)
      .lte('next_due_date', sevenDaysFromNow)
      .order('next_due_date', { ascending: true }),
    supabase
      .from('properties')
      .select('current_value')
      .eq('landlord_id', landlord.id)
      .eq('status', 'active'),
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('landlord_id', landlord.id)
      .eq('status', 'active'),
  ])

  const properties = propertiesResult.data ?? []
  const recentTx = recentTxResult.data ?? []
  const chartTx = chartTxResult.data ?? []
  const pendingPayments = (pendingPaymentsResult.data ?? []).filter((payment) =>
    isRecurringPaymentPending(payment),
  )
  const upcomingReminders = pendingPayments.slice(0, 5)

  const totalValue = (portfolioResult.data ?? []).reduce(
    (s, p) => s + (p.current_value ?? 0),
    0,
  )
  const activeCount = activeCountResult.count ?? 0

  const monthlyIncome = (incomeResult.data ?? []).reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = (expenseResult.data ?? []).reduce((sum, t) => sum + t.amount, 0)
  const monthlyNetIncome = monthlyIncome - monthlyExpenses
  const pendingCount = pendingPayments.length

  const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i))
  const chartData = buildChartData(chartTx, months)

  const firstName = (landlord.full_name ?? '').split(' ')[0] || 'there'
  const hour = now.getHours()
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <OverviewDashboard
      greeting={`${greeting}, ${firstName}`}
      dateSubtitle={now.toLocaleDateString('en-CA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
      initialDisplayCurrency={(landlord as { display_currency?: string }).display_currency ?? 'CAD'}
      totalPortfolioValue={totalValue}
      monthlyNetIncome={monthlyNetIncome}
      activeProperties={activeCount}
      pendingReminders={pendingCount}
      chartData={chartData}
      recentTx={recentTx}
      properties={properties}
      upcomingReminders={upcomingReminders}
    />
  )
}
