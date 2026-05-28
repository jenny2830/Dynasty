'use client'

import { useState, useTransition } from 'react'
import {
  BarChart3,
  FileDown,
  Printer,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Section, SectionHeader } from '@/components/ui/section'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths } from 'date-fns'

interface Property {
  id: string
  name: string
}

type ReportType = 'pl' | 'cash_flow' | 'tax_summary' | 'expense_breakdown'

interface Transaction {
  id: string
  type: string
  amount: number
  category: string
  transaction_date: string
  description: string | null
  is_tax_deductible: boolean
  properties: { name: string } | null
}

interface ReportBuilderProps {
  properties: Property[]
}

function getPresetDates(preset: string): { start: string; end: string } {
  const now = new Date()
  switch (preset) {
    case 'this_month':
      return {
        start: format(startOfMonth(now), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd'),
      }
    case 'last_month': {
      const d = subMonths(now, 1)
      return { start: format(startOfMonth(d), 'yyyy-MM-dd'), end: format(endOfMonth(d), 'yyyy-MM-dd') }
    }
    case 'this_quarter':
      return { start: format(startOfQuarter(now), 'yyyy-MM-dd'), end: format(endOfQuarter(now), 'yyyy-MM-dd') }
    case 'this_year':
      return { start: format(startOfYear(now), 'yyyy-MM-dd'), end: format(endOfYear(now), 'yyyy-MM-dd') }
    case 'last_year': {
      const ly = new Date(now.getFullYear() - 1, 0, 1)
      return { start: format(startOfYear(ly), 'yyyy-MM-dd'), end: format(endOfYear(ly), 'yyyy-MM-dd') }
    }
    default:
      return { start: format(startOfYear(now), 'yyyy-MM-dd'), end: format(endOfYear(now), 'yyyy-MM-dd') }
  }
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function ReportBuilder({ properties }: ReportBuilderProps) {
  const [reportType, setReportType] = useState<ReportType>('pl')
  const [propertyId, setPropertyId] = useState<string>('all')
  const [preset, setPreset] = useState<string>('this_year')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [generated, setGenerated] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleGenerate = () => {
    startTransition(async () => {
      const supabase = createClient()

      const { start, end } =
        preset === 'custom'
          ? { start: customStart, end: customEnd }
          : getPresetDates(preset)

      let query = supabase
        .from('transactions')
        .select('id, type, amount, category, transaction_date, description, is_tax_deductible, properties(name)')
        .gte('transaction_date', start)
        .lte('transaction_date', end)
        .order('transaction_date', { ascending: true })

      if (propertyId !== 'all') {
        query = query.eq('property_id', propertyId)
      }

      const { data } = await query
      setTransactions((data as unknown as Transaction[]) ?? [])
      setGenerated(true)
    })
  }

  const { start: dateStart, end: dateEnd } =
    preset === 'custom'
      ? { start: customStart, end: customEnd }
      : getPresetDates(preset)

  const income = transactions.filter((t) => t.type === 'income')
  const expenses = transactions.filter((t) => t.type === 'expense')
  const totalIncome = income.reduce((s, t) => s + t.amount, 0)
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0)
  const netIncome = totalIncome - totalExpenses

  const expenseByCategory = expenses.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount
    return acc
  }, {})

  const incomeByCategory = income.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount
    return acc
  }, {})

  const taxDeductible = expenses.filter((t) => t.is_tax_deductible)
  const totalDeductible = taxDeductible.reduce((s, t) => s + t.amount, 0)

  const monthlyMap = transactions.reduce<Record<string, { income: number; expenses: number }>>((acc, t) => {
    const month = t.transaction_date.slice(0, 7)
    if (!acc[month]) acc[month] = { income: 0, expenses: 0 }
    if (t.type === 'income') acc[month].income += t.amount
    else acc[month].expenses += t.amount
    return acc
  }, {})

  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Type', 'Category', 'Description', 'Amount', 'Property', 'Tax Deductible'],
      ...transactions.map((t) => [
        t.transaction_date,
        t.type,
        t.category,
        t.description ?? '',
        t.amount.toString(),
        (t.properties as { name: string } | null)?.name ?? '',
        t.is_tax_deductible ? 'Yes' : 'No',
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCSV(csv, `dynasty-report-${dateStart}-${dateEnd}.csv`)
  }

  const reportTypeLabel = {
    pl: 'Profit & Loss',
    cash_flow: 'Cash Flow',
    tax_summary: 'Tax Summary',
    expense_breakdown: 'Expense Breakdown',
  }[reportType]

  return (
    <div className="space-y-7">
      {/* Controls */}
      <Section className="px-7 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pl">Profit &amp; Loss</SelectItem>
                <SelectItem value="cash_flow">Cash Flow</SelectItem>
                <SelectItem value="tax_summary">Tax Summary</SelectItem>
                <SelectItem value="expense_breakdown">Expense Breakdown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Property</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All properties</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Period</Label>
            <Select value={preset} onValueChange={setPreset}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This month</SelectItem>
                <SelectItem value="last_month">Last month</SelectItem>
                <SelectItem value="this_quarter">This quarter</SelectItem>
                <SelectItem value="this_year">This year</SelectItem>
                <SelectItem value="last_year">Last year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleGenerate} disabled={isPending} className="w-full">
              <BarChart3 />
              {isPending ? 'Generating…' : 'Generate'}
            </Button>
          </div>
        </div>

        {preset === 'custom' && (
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          </div>
        )}
      </Section>

      {/* Results */}
      {generated && (
        <div className="space-y-7" id="report-output">
          {/* Report header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[rgba(201,168,76,0.08)]">
            <div>
              <h2 className="flex items-center gap-3 font-serif text-[26px] font-semibold tracking-[0.04em] text-dynasty-warm-white">
                <span className="text-[10px] text-dynasty-gold/70 leading-none">◆</span>
                {reportTypeLabel}
              </h2>
              <p className="mt-1 font-sans text-[11px] font-light uppercase tracking-[0.14em] text-dynasty-gray-500">
                {dateStart && dateEnd
                  ? `${formatDate(dateStart)} — ${formatDate(dateEnd)}`
                  : ''}
                {propertyId !== 'all' && properties.find((p) => p.id === propertyId)
                  ? ` · ${properties.find((p) => p.id === propertyId)?.name}`
                  : ' · All properties'}
              </p>
            </div>
            <div className="flex gap-2 no-print">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <FileDown /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer /> Print
              </Button>
            </div>
          </div>

          {transactions.length === 0 ? (
            <Section className="flex items-center justify-center py-16">
              <p className="font-sans text-[12px] font-light text-dynasty-gray-500">
                No transactions found for this period
              </p>
            </Section>
          ) : (
            <>
              {reportType === 'pl' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {[
                      { label: 'Total Income', value: totalIncome, color: 'text-dynasty-gold', icon: TrendingUp, positive: true },
                      { label: 'Total Expenses', value: totalExpenses, color: 'text-dynasty-rose-gold', icon: TrendingDown, positive: false },
                      { label: 'Net Income', value: netIncome, color: netIncome >= 0 ? 'text-dynasty-gold' : 'text-dynasty-rose-gold', icon: Minus, positive: netIncome >= 0 },
                    ].map(({ label, value, color, icon: Icon }) => (
                      <div
                        key={label}
                        className="relative overflow-hidden rounded-[2px] border border-[rgba(201,168,76,0.1)] bg-[linear-gradient(135deg,#161616_0%,#1C1A17_100%)] px-6 py-5 shadow-[var(--shadow-card)]"
                      >
                        <div
                          className="pointer-events-none absolute top-0 left-[10%] right-[10%] h-px"
                          style={{ background: 'var(--accent-top)' }}
                        />
                        <div className="flex items-center justify-between">
                          <p className="flex items-center gap-2 font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                            <span className="text-[6px] text-[rgba(201,168,76,0.5)] leading-none">◆</span>
                            {label}
                          </p>
                          <Icon className={`h-4 w-4 ${color}`} strokeWidth={1.2} />
                        </div>
                        <p className={`mt-3 font-display text-[36px] leading-none tracking-[0.04em] ${color}`}>
                          {formatCurrency(value)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <CategoryTable title="Income by Category" data={incomeByCategory} total={totalIncome} color="gold" />
                    <CategoryTable title="Expenses by Category" data={expenseByCategory} total={totalExpenses} color="rose" />
                  </div>
                </div>
              )}

              {reportType === 'cash_flow' && (
                <Section>
                  <SectionHeader title="Monthly Cash Flow" />
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-dynasty-black border-b border-[rgba(201,168,76,0.1)]">
                        <tr>
                          {['Month', 'Income', 'Expenses', 'Net Cash Flow'].map((h) => (
                            <th
                              key={h}
                              className="px-6 py-3.5 text-left font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(monthlyMap)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([month, data]) => {
                            const net = data.income - data.expenses
                            return (
                              <tr key={month} className="border-b border-[rgba(255,255,255,0.025)] transition-colors hover:bg-[rgba(201,168,76,0.025)]">
                                <td className="px-6 py-3.5 font-sans text-[13px] text-dynasty-warm-white">
                                  {format(new Date(month + '-01'), 'MMMM yyyy')}
                                </td>
                                <td className="px-6 py-3.5 font-mono text-[13px] font-medium text-dynasty-gold">
                                  {formatCurrency(data.income)}
                                </td>
                                <td className="px-6 py-3.5 font-mono text-[13px] font-medium text-dynasty-rose-gold">
                                  {formatCurrency(data.expenses)}
                                </td>
                                <td className={`px-6 py-3.5 font-mono text-[13px] font-medium ${net >= 0 ? 'text-dynasty-gold' : 'text-dynasty-rose-gold'}`}>
                                  {formatCurrency(net)}
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </Section>
              )}

              {reportType === 'tax_summary' && (
                <div className="space-y-5">
                  <div className="relative overflow-hidden rounded-[2px] border border-[rgba(201,168,76,0.2)] bg-[linear-gradient(135deg,#161616_0%,#1C1A17_100%)] px-7 py-6 shadow-[var(--shadow-card)]">
                    <div
                      className="pointer-events-none absolute top-0 left-[10%] right-[10%] h-px"
                      style={{ background: 'var(--accent-top)' }}
                    />
                    <p className="flex items-center gap-2 font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                      <span className="text-[6px] text-[rgba(201,168,76,0.5)] leading-none">◆</span>
                      Total Tax-Deductible Expenses
                    </p>
                    <p className="mt-3 font-display text-[48px] leading-none tracking-[0.04em] text-dynasty-gold">
                      {formatCurrency(totalDeductible)}
                    </p>
                    <p className="mt-2 font-sans text-[11px] font-light tracking-[0.06em] text-dynasty-gray-500">
                      {taxDeductible.length} deductible transaction{taxDeductible.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <TransactionTable transactions={taxDeductible} title="Deductible Transactions" />
                </div>
              )}

              {reportType === 'expense_breakdown' && (
                <CategoryTable
                  title="Expense Breakdown"
                  data={expenseByCategory}
                  total={totalExpenses}
                  color="rose"
                  showBar
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function CategoryTable({
  title,
  data,
  total,
  color,
  showBar,
}: {
  title: string
  data: Record<string, number>
  total: number
  color: 'gold' | 'rose'
  showBar?: boolean
}) {
  const sorted = Object.entries(data).sort(([, a], [, b]) => b - a)
  const colorClass = color === 'gold' ? 'text-dynasty-gold' : 'text-dynasty-rose-gold'
  const barClass = color === 'gold' ? 'bg-dynasty-gold' : 'bg-dynasty-rose-gold'

  return (
    <Section>
      <SectionHeader title={title} />
      <div className="divide-y divide-[rgba(255,255,255,0.025)]">
        {sorted.map(([category, amount]) => {
          const pct = total > 0 ? (amount / total) * 100 : 0
          return (
            <div key={category} className="flex items-center gap-4 px-7 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-sans text-[13px] text-dynasty-warm-white">
                    {category}
                  </span>
                  <span className={`font-mono text-[13px] font-medium ${colorClass}`}>
                    {formatCurrency(amount)}
                  </span>
                </div>
                {showBar && (
                  <div className="h-[2px] w-full overflow-hidden bg-dynasty-gray-700">
                    <div className={`h-full ${barClass}`} style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
              <span className="w-10 text-right font-mono text-[11px] font-light text-dynasty-gray-500">
                {pct.toFixed(0)}%
              </span>
            </div>
          )
        })}
        <div className="flex items-center justify-between px-7 py-3.5 bg-[rgba(201,168,76,0.04)]">
          <span className="font-sans text-[12px] font-light uppercase tracking-[0.18em] text-dynasty-warm-white">
            Total
          </span>
          <span className={`font-mono text-[14px] font-medium ${colorClass}`}>
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </Section>
  )
}

function TransactionTable({
  transactions,
  title,
}: {
  transactions: Transaction[]
  title: string
}) {
  return (
    <Section>
      <SectionHeader title={title} />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dynasty-black border-b border-[rgba(201,168,76,0.1)]">
            <tr>
              {['Date', 'Category', 'Description', 'Amount'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3.5 text-left font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-[rgba(255,255,255,0.025)] transition-colors hover:bg-[rgba(201,168,76,0.025)]">
                <td className="whitespace-nowrap px-6 py-3 font-sans text-[12px] font-light text-dynasty-gray-400">
                  {formatDate(t.transaction_date)}
                </td>
                <td className="px-6 py-3">
                  <Badge>{t.category}</Badge>
                </td>
                <td className="px-6 py-3 font-sans text-[13px] text-dynasty-warm-white">
                  {t.description ?? '—'}
                </td>
                <td className="px-6 py-3 font-mono text-[13px] font-medium text-dynasty-gold">
                  {formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
