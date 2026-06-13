'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard'
import { isRecurringPaymentPending } from '@/lib/recurring-utils'
import { useAppTheme } from '@/lib/theme-context'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'

type ChartPoint = { month: string; income: number; expenses: number }

type PropertyPreview = {
  id: string
  name: string
  city: string
  province: string
  type: string
}

type RecentTx = {
  id: string
  type: string
  amount: number
  category: string
  transaction_date: string
  description: string | null
}

type UpcomingPayment = {
  id: string
  name: string
  amount: number
  next_due_date: string
}

interface OverviewState {
  loaded: boolean
  greeting: string
  dateSubtitle: string
  displayCurrency: string
  portfolioValue: number
  monthlyNetIncome: number
  activeProperties: number
  pendingReminders: number
  chartData: ChartPoint[]
  recentTransactions: RecentTx[]
  properties: PropertyPreview[]
  upcomingReminders: UpcomingPayment[]
}

function buildChartData(
  transactions: { type: string; amount: number; transaction_date: string }[],
  months: Date[],
): ChartPoint[] {
  return months.map((monthDate) => {
    const monthKey = format(monthDate, 'yyyy-MM')
    const monthTxs = transactions.filter((t) =>
      (t.transaction_date ?? '').startsWith(monthKey),
    )
    return {
      month: format(monthDate, 'MMM'),
      income: monthTxs
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + (t.amount || 0), 0),
      expenses: monthTxs
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + (t.amount || 0), 0),
    }
  })
}

function buildGreeting(now: Date): string {
  const hour = now.getHours()
  return hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
}

function buildDateSubtitle(now: Date): string {
  return now.toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function OverviewClient() {
  const { theme } = useAppTheme()
  const [state, setState] = useState<OverviewState>(() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i))
    return {
      loaded: false,
      greeting: `${buildGreeting(now)}, there`,
      dateSubtitle: buildDateSubtitle(now),
      displayCurrency: 'CAD',
      portfolioValue: 0,
      monthlyNetIncome: 0,
      activeProperties: 0,
      pendingReminders: 0,
      chartData: buildChartData([], months),
      recentTransactions: [],
      properties: [],
      upcomingReminders: [],
    }
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const now = new Date()
      const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i))

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setState((s) => ({ ...s, loaded: true }))
          return
        }

        const { data: landlord } = await supabase
          .from('landlords')
          .select('id, full_name, display_currency')
          .eq('auth_user_id', user.id)
          .maybeSingle()

        if (!landlord) {
          setState((s) => ({ ...s, loaded: true }))
          return
        }

        const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
        const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
        const sixMonthsAgo = format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd')
        const sevenDaysFromNow = format(
          new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
          'yyyy-MM-dd',
        )

        const [
          propertiesResult,
          monthTxResult,
          chartTxResult,
          recentTxResult,
          recurringResult,
        ] = await Promise.all([
          supabase
            .from('properties')
            .select('id, name, city, province, status, current_value, type')
            .eq('landlord_id', landlord.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false }),
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
            .from('transactions')
            .select('id, type, amount, category, transaction_date, description')
            .eq('landlord_id', landlord.id)
            .order('transaction_date', { ascending: false })
            .limit(5),
          supabase
            .from('recurring_payments')
            .select('id, name, amount, next_due_date, last_paid_date, is_active')
            .eq('landlord_id', landlord.id)
            .eq('is_active', true)
            .lte('next_due_date', sevenDaysFromNow)
            .order('next_due_date', { ascending: true }),
        ])

        const activeProps = (propertiesResult.data ?? []) as PropertyPreview[]
        const portfolioValue = (propertiesResult.data ?? []).reduce(
          (sum, p) => sum + ((p as { current_value?: number }).current_value || 0),
          0,
        )

        const monthTx = monthTxResult.data ?? []
        const income = monthTx
          .filter((t) => t.type === 'income')
          .reduce((s, t) => s + (t.amount || 0), 0)
        const expenses = monthTx
          .filter((t) => t.type === 'expense')
          .reduce((s, t) => s + (t.amount || 0), 0)

        const pendingPayments = (recurringResult.data ?? []).filter((payment) =>
          isRecurringPaymentPending(payment),
        )

        setState({
          loaded: true,
          greeting: `${buildGreeting(now)}, ${
            (landlord.full_name ?? '').split(' ')[0] || 'there'
          }`,
          dateSubtitle: buildDateSubtitle(now),
          displayCurrency:
            (landlord as { display_currency?: string }).display_currency ?? 'CAD',
          portfolioValue,
          monthlyNetIncome: income - expenses,
          activeProperties: activeProps.length,
          pendingReminders: pendingPayments.length,
          chartData: buildChartData(chartTxResult.data ?? [], months),
          recentTransactions: (recentTxResult.data ?? []) as RecentTx[],
          properties: activeProps,
          upcomingReminders: pendingPayments.slice(0, 5) as UpcomingPayment[],
        })
      } catch (err) {
        console.error('Overview load error:', err)
        setState((s) => ({ ...s, loaded: true }))
      }
    }
    load()
  }, [])

  if (!state.loaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            border: `2px solid ${theme.accent}30`,
            borderTopColor: theme.accent,
            borderRadius: '50%',
            animation: 'dynasty-spin 0.6s linear infinite',
          }}
        />
        <style>{`@keyframes dynasty-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <OverviewDashboard
      greeting={state.greeting}
      dateSubtitle={state.dateSubtitle}
      initialDisplayCurrency={state.displayCurrency}
      totalPortfolioValue={state.portfolioValue}
      monthlyNetIncome={state.monthlyNetIncome}
      activeProperties={state.activeProperties}
      pendingReminders={state.pendingReminders}
      chartData={state.chartData}
      recentTx={state.recentTransactions}
      properties={state.properties}
      upcomingReminders={state.upcomingReminders}
    />
  )
}
