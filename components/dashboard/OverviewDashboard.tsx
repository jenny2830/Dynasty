'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Building2, Plus, ArrowRight, Bell } from 'lucide-react'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart'
import { formatCurrency, formatDate } from '@/lib/utils'
import { convertAmount } from '@/lib/currency'
import { COUNTRIES } from '@/lib/geo'
import { updateDisplayCurrency } from '@/app/actions/landlord'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { Section, SectionHeader } from '@/components/ui/section'
import { useAppTheme } from '@/lib/theme-context'

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

type ChartPoint = {
  month: string
  income: number
  expenses: number
}

interface OverviewDashboardProps {
  greeting: string
  dateSubtitle: string
  initialDisplayCurrency: string
  totalPortfolioValue: number
  monthlyNetIncome: number
  activeProperties: number
  pendingReminders: number
  chartData: ChartPoint[]
  recentTx: RecentTx[]
  properties: PropertyPreview[]
  upcomingReminders: UpcomingPayment[]
}

export function OverviewDashboard({
  greeting,
  dateSubtitle,
  initialDisplayCurrency,
  totalPortfolioValue,
  monthlyNetIncome,
  activeProperties,
  pendingReminders,
  chartData,
  recentTx,
  properties,
  upcomingReminders,
}: OverviewDashboardProps) {
  const { theme } = useAppTheme()
  const [displayCurrency, setDisplayCurrency] = useState(initialDisplayCurrency)
  const [, startTransition] = useTransition()

  const convertedPortfolio = convertAmount(totalPortfolioValue, displayCurrency)
  const convertedNet = convertAmount(monthlyNetIncome, displayCurrency)

  const convertedChartData = chartData.map((d) => ({
    ...d,
    income: convertAmount(d.income, displayCurrency),
    expenses: convertAmount(d.expenses, displayCurrency),
  }))

  function handleCurrencyChange(currency: string) {
    setDisplayCurrency(currency)
    startTransition(async () => {
      await updateDisplayCurrency(currency)
    })
  }

  return (
    <div className="space-y-9">
      <PageHeader title={greeting} subtitle={dateSubtitle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={displayCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            aria-label="Display currency"
            style={{
              background: theme.inputBg,
              border: `1px solid ${theme.inputBorder}`,
              color: theme.textPrimary,
              fontFamily: "'Jost', sans-serif",
              fontSize: '11px',
              letterSpacing: '0.1em',
              padding: '6px 12px',
              borderRadius: '1px',
              cursor: 'pointer',
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.currency} value={c.currency}>
                {c.currency} — {c.name}
              </option>
            ))}
          </select>
        </div>
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

      <StatsCards
        totalPortfolioValue={convertedPortfolio}
        monthlyNetIncome={convertedNet}
        activeProperties={activeProperties}
        pendingReminders={pendingReminders}
        displayCurrency={displayCurrency}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Section className="lg:col-span-3">
          <SectionHeader title="Income vs Expenses" description="Last six months" />
          <div className="px-5 py-5">
            <IncomeExpenseChart data={convertedChartData} displayCurrency={displayCurrency} />
          </div>
        </Section>

        <Section className="lg:col-span-2">
          <SectionHeader
            title="Recent Transactions"
            action={
              <Link
                href="/transactions"
                className="flex items-center gap-1.5 font-sans text-[12px] font-normal uppercase tracking-[0.18em] text-[var(--accent-c)] transition-colors hover:opacity-80"
              >
                View All <ArrowRight className="h-3 w-3" strokeWidth={1.2} />
              </Link>
            }
          />
          <div className="divide-y divide-[var(--divider-c)]">
            {recentTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <p className="mb-3 font-sans text-[12px] tracking-[0.4em] text-[var(--accent-c)] opacity-30">
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
              recentTx.map((tx) => {
                const converted = convertAmount(tx.amount, displayCurrency)
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-7 py-3.5 transition-colors hover:bg-[var(--table-row-hover-bg)]"
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
                        color: tx.type === 'income' ? 'var(--value-pos-c)' : 'var(--value-neg-c)',
                      }}
                    >
                      {tx.type === 'income' ? '+' : '−'}
                      {formatCurrency(converted, displayCurrency, 0)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section>
          <SectionHeader
            title="Properties"
            action={
              <Link
                href="/properties"
                className="flex items-center gap-1.5 font-sans text-[12px] font-normal uppercase tracking-[0.18em] text-[var(--accent-c)] transition-colors hover:opacity-80"
              >
                View All <ArrowRight className="h-3 w-3" strokeWidth={1.2} />
              </Link>
            }
          />
          <div className="divide-y divide-[var(--divider-c)]">
            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <p className="mb-3 font-sans text-[12px] tracking-[0.4em] text-[var(--accent-c)] opacity-30">
                  ◆ ◇ ◆
                </p>
                <Building2
                  className="h-9 w-9 text-[var(--accent-c)] opacity-20"
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
                  className="flex items-center justify-between px-7 py-4 transition-colors hover:bg-[var(--table-row-hover-bg)]"
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
                className="flex items-center gap-1.5 font-sans text-[12px] font-normal uppercase tracking-[0.18em] text-[var(--accent-c)] transition-colors hover:opacity-80"
              >
                View All <ArrowRight className="h-3 w-3" strokeWidth={1.2} />
              </Link>
            }
          />
          <div className="divide-y divide-[var(--divider-c)]">
            {upcomingReminders.length === 0 ? (
              <div className="flex items-center gap-3 px-7 py-5">
                <Bell className="h-4 w-4 shrink-0 text-dynasty-gold" strokeWidth={1.2} />
                <p className="font-sans text-[14px] font-normal tracking-[0.04em] text-dynasty-gray-400">
                  All clear — no pending reminders
                </p>
              </div>
            ) : (
              upcomingReminders.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between px-7 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[15px] text-dynasty-warm-white">
                      {payment.name}
                    </p>
                    <p className="mt-0.5 font-sans text-[13px] font-normal text-dynasty-gray-500">
                      Due {formatDate(payment.next_due_date)}
                    </p>
                  </div>
                  <span style={{
                    marginLeft: '12px',
                    flexShrink: 0,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '15px',
                    fontWeight: 500,
                    letterSpacing: '-0.025em',
                    color: 'var(--value-neg-c)',
                  }}>
                    {formatCurrency(
                      convertAmount(payment.amount, displayCurrency),
                      displayCurrency,
                      0,
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </Section>
      </div>
    </div>
  )
}
