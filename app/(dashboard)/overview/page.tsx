import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart'
import { formatDate } from '@/lib/utils'
import { Building2, Plus, ArrowRight, Bell } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="font-serif text-3xl text-dynasty-cream mb-2">Welcome to DYNASTY</h1>
        <p className="text-dynasty-gray-400 mb-6">Complete your profile to get started.</p>
        <Button asChild>
          <Link href="/settings">Set up profile</Link>
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

  const totalPortfolioValue = (propertiesResult.data ?? []).reduce(
    (s, p) => s + (p.current_value ?? 0),
    0
  )

  // Fetch all active properties for total count and portfolio value
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

  // Build 6-month chart data
  const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i))
  const chartData = buildChartData(chartTx, months)

  const firstName = landlord.full_name.split(' ')[0]
  const hour = now.getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-dynasty-gray-400">
            {now.toLocaleDateString('en-CA', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/transactions/new">
              <Plus className="h-4 w-4" /> Transaction
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/properties/new">
              <Plus className="h-4 w-4" /> Property
            </Link>
          </Button>
        </div>
      </div>

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
        <div className="lg:col-span-3 rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900">
          <div className="border-b border-dynasty-gray-700 px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-dynasty-cream">
              Income vs Expenses
            </h2>
            <p className="text-xs text-dynasty-gray-400 mt-0.5">Last 6 months</p>
          </div>
          <div className="px-4 py-4">
            <IncomeExpenseChart data={chartData} />
          </div>
        </div>

        {/* Recent transactions — 2/5 width */}
        <div className="lg:col-span-2 rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900">
          <div className="flex items-center justify-between border-b border-dynasty-gray-700 px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-dynasty-cream">
              Recent Transactions
            </h2>
            <Link
              href="/transactions"
              className="flex items-center gap-1 text-xs text-dynasty-gold hover:text-dynasty-gold-light transition-colors"
            >
              All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-dynasty-gray-800">
            {recentTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-dynasty-gray-400">No transactions yet</p>
                <Button asChild variant="ghost" size="sm" className="mt-2">
                  <Link href="/transactions/new">Add first</Link>
                </Button>
              </div>
            ) : (
              recentTx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-dynasty-gray-800/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dynasty-cream truncate">
                      {tx.description ?? tx.category}
                    </p>
                    <p className="text-xs text-dynasty-gray-400">
                      {formatDate(tx.transaction_date)}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 font-mono text-sm font-semibold ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}$
                    {tx.amount.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Properties + Reminders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900">
          <div className="flex items-center justify-between border-b border-dynasty-gray-700 px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-dynasty-cream">Properties</h2>
            <Link
              href="/properties"
              className="flex items-center gap-1 text-xs text-dynasty-gold hover:text-dynasty-gold-light transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-dynasty-gray-800">
            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Building2
                  className="h-8 w-8 text-dynasty-gray-600 mb-2"
                  strokeWidth={1}
                />
                <p className="text-sm text-dynasty-gray-400">No properties yet</p>
                <Button asChild variant="ghost" size="sm" className="mt-2">
                  <Link href="/properties/new">Add property</Link>
                </Button>
              </div>
            ) : (
              properties.map((p) => (
                <Link
                  key={p.id}
                  href={`/properties/${p.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-dynasty-gray-800/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dynasty-cream truncate">{p.name}</p>
                    <p className="text-xs text-dynasty-gray-400">
                      {p.city}, {p.province}
                    </p>
                  </div>
                  <Badge variant="default" className="ml-4 shrink-0 capitalize">
                    {p.type}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900">
          <div className="flex items-center justify-between border-b border-dynasty-gray-700 px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-dynasty-cream">
              Upcoming Reminders
            </h2>
            <Link
              href="/recurring"
              className="flex items-center gap-1 text-xs text-dynasty-gold hover:text-dynasty-gold-light transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-dynasty-gray-800">
            {reminders.length === 0 ? (
              <div className="flex items-center gap-3 px-6 py-5">
                <Bell className="h-4 w-4 text-emerald-400 shrink-0" strokeWidth={1.5} />
                <p className="text-sm text-dynasty-gray-400">All clear — no pending reminders</p>
              </div>
            ) : (
              reminders.map((r) => {
                const payment = r.recurring_payments as { name: string; amount: number } | null
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-6 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-dynasty-cream truncate">
                        {payment?.name ?? 'Payment due'}
                      </p>
                      <p className="text-xs text-dynasty-gray-400">
                        Due {formatDate(r.due_date)}
                      </p>
                    </div>
                    {payment?.amount && (
                      <span className="ml-3 shrink-0 font-mono text-sm text-dynasty-gold">
                        ${payment.amount.toLocaleString('en-CA', { minimumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
