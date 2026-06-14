'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

interface OverviewData {
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

function greetingFor(now: Date): string {
  const hour = now.getHours()
  return hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
}

function dateSubtitleFor(now: Date): string {
  return now.toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function emptyData(): OverviewData {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i))
  return {
    greeting: `${greetingFor(now)}, there`,
    dateSubtitle: dateSubtitleFor(now),
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
}

export function OverviewClient() {
  const { theme } = useAppTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [data, setData] = useState<OverviewData>(emptyData)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const now = new Date()
      const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i))

      try {
        // ── Step 1: Ensure a valid session (mirrors the pattern used by Properties page) ──
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError || !refreshData.session) {
            router.push('/login')
            return
          }
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // ── Step 2: Resolve landlord with up to 3 retries (guards against transient auth lag) ──
        type LandlordRow = { id: string; full_name: string; email: string; display_currency: string }
        let landlord: LandlordRow | null = null
        for (let attempt = 0; attempt < 3; attempt++) {
          const { data, error: lErr } = await supabase
            .from('landlords')
            .select('id, full_name, email, display_currency')
            .eq('auth_user_id', user.id)
            .maybeSingle()
          if (data) { landlord = data as LandlordRow; break }
          if (lErr) console.error(`[Overview] landlord attempt ${attempt + 1}:`, lErr)
          if (attempt < 2) await new Promise(r => setTimeout(r, 600))
        }

        if (!landlord) {
          console.error('[Overview] landlord not found after 3 attempts for user', user.id)
          setLoadError(true)
          setLoading(false)
          return
        }

        const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
        const monthEnd   = format(endOfMonth(now),   'yyyy-MM-dd')
        const sevenDaysFromNow = format(
          new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
          'yyyy-MM-dd',
        )

        // ── Step 3: Parallel data load ──
        // NOTE: properties query has NO status filter so we capture the full portfolio,
        // including 'vacant' properties. The active-count is derived client-side.
        // transactions query has NO date filter — we load all so the chart always
        // has data and the 6-month window is derived client-side.
        const [
          propertiesResult,
          allTxResult,
          recentTxResult,
          recurringResult,
        ] = await Promise.all([
          supabase
            .from('properties')
            .select('id, name, city, province, status, current_value, purchase_price, type')
            .eq('landlord_id', landlord.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('transactions')
            .select('id, type, amount, category, transaction_date, description')
            .eq('landlord_id', landlord.id)
            .order('transaction_date', { ascending: false }),
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

        // Log any query errors for debugging without crashing
        if (propertiesResult.error) console.error('[Overview] properties error:', propertiesResult.error)
        if (allTxResult.error)      console.error('[Overview] transactions error:', allTxResult.error)
        if (recentTxResult.error)   console.error('[Overview] recent-tx error:',  recentTxResult.error)
        if (recurringResult.error)  console.error('[Overview] recurring error:',  recurringResult.error)

        // ── Step 4: Derive stats ──
        type PropRow = {
          id: string; name: string; city: string; province: string
          status: string; current_value: number | null; purchase_price: number | null; type: string
        }
        const allProps = (propertiesResult.data ?? []) as PropRow[]

        // Portfolio value: use current_value, fall back to purchase_price if not set
        const portfolioValue = allProps.reduce(
          (sum, p) => sum + (p.current_value ?? p.purchase_price ?? 0),
          0,
        )

        // Active count = properties that are not 'inactive' (active + vacant are live portfolio entries)
        const activeProps = allProps.filter(p => p.status !== 'inactive') as PropertyPreview[]

        const allTx = allTxResult.data ?? []

        // Monthly net income — this calendar month
        const monthTx = allTx.filter(t =>
          t.transaction_date >= monthStart && t.transaction_date <= monthEnd
        )
        const income   = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
        const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)

        // Pending reminders
        const pendingPayments = (recurringResult.data ?? []).filter(payment =>
          isRecurringPaymentPending(payment),
        )

        const displayName =
          (landlord.full_name ?? '').trim().split(' ')[0] ||
          (landlord.email ?? '').split('@')[0] ||
          'there'

        setData({
          greeting: `${greetingFor(now)}, ${displayName}`,
          dateSubtitle: dateSubtitleFor(now),
          displayCurrency: landlord.display_currency ?? 'CAD',
          portfolioValue,
          monthlyNetIncome: income - expenses,
          activeProperties: activeProps.length,
          pendingReminders: pendingPayments.length,
          chartData: buildChartData(allTx, months),
          recentTransactions: (recentTxResult.data ?? []) as RecentTx[],
          properties: activeProps,
          upcomingReminders: pendingPayments.slice(0, 5) as UpcomingPayment[],
        })
      } catch (err) {
        console.error('[Overview] unexpected error:', err)
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
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

  if (loadError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        gap: '16px',
      }}>
        <p style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '14px',
          letterSpacing: '0.06em',
          color: theme.valueNegative,
        }}>
          Failed to load your overview. Please refresh the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.accent}50`,
            color: theme.accent,
            fontFamily: "'Jost', sans-serif",
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '10px 24px',
            borderRadius: '1px',
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <OverviewDashboard
      greeting={data.greeting}
      dateSubtitle={data.dateSubtitle}
      initialDisplayCurrency={data.displayCurrency}
      totalPortfolioValue={data.portfolioValue}
      monthlyNetIncome={data.monthlyNetIncome}
      activeProperties={data.activeProperties}
      pendingReminders={data.pendingReminders}
      chartData={data.chartData}
      recentTx={data.recentTransactions}
      properties={data.properties}
      upcomingReminders={data.upcomingReminders}
    />
  )
}
