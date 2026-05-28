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

  // Group by category
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

  // Group by month for cash flow
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
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Report type</Label>
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

          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
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
              <BarChart3 className="h-4 w-4" />
              {isPending ? 'Generating…' : 'Generate'}
            </Button>
          </div>
        </div>

        {preset === 'custom' && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>End date</Label>
              <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {generated && (
        <div className="space-y-6" id="report-output">
          {/* Report header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-dynasty-cream">
                {reportTypeLabel}
              </h2>
              <p className="text-sm text-dynasty-gray-400 mt-0.5">
                {dateStart && dateEnd
                  ? `${formatDate(dateStart)} — ${formatDate(dateEnd)}`
                  : ''}
                {propertyId !== 'all' && properties.find((p) => p.id === propertyId)
                  ? ` · ${properties.find((p) => p.id === propertyId)?.name}`
                  : ' · All properties'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <FileDown className="h-4 w-4" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 flex items-center justify-center py-16">
              <p className="text-dynasty-gray-400">No transactions found for this period</p>
            </div>
          ) : (
            <>
              {/* P&L Report */}
              {reportType === 'pl' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Total Income', value: totalIncome, color: 'text-emerald-400', icon: TrendingUp },
                      { label: 'Total Expenses', value: totalExpenses, color: 'text-red-400', icon: TrendingDown },
                      { label: 'Net Income', value: netIncome, color: netIncome >= 0 ? 'text-dynasty-gold' : 'text-red-400', icon: Minus },
                    ].map(({ label, value, color, icon: Icon }) => (
                      <div key={label} className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs uppercase tracking-wider text-dynasty-gray-400">{label}</p>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <p className={`font-mono text-2xl font-semibold ${color}`}>
                          {formatCurrency(value)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <CategoryTable title="Income by Category" data={incomeByCategory} total={totalIncome} color="emerald" />
                    <CategoryTable title="Expenses by Category" data={expenseByCategory} total={totalExpenses} color="red" />
                  </div>
                </div>
              )}

              {/* Cash Flow */}
              {reportType === 'cash_flow' && (
                <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 overflow-hidden">
                  <div className="border-b border-dynasty-gray-700 px-6 py-4">
                    <h3 className="font-serif text-lg font-semibold text-dynasty-cream">Monthly Cash Flow</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-dynasty-gray-700">
                          {['Month', 'Income', 'Expenses', 'Net Cash Flow'].map((h) => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dynasty-gray-400">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dynasty-gray-800">
                        {Object.entries(monthlyMap)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([month, data]) => {
                            const net = data.income - data.expenses
                            return (
                              <tr key={month} className="hover:bg-dynasty-gray-800/50 transition-colors">
                                <td className="px-6 py-3.5 text-dynasty-cream">{format(new Date(month + '-01'), 'MMMM yyyy')}</td>
                                <td className="px-6 py-3.5 font-mono text-emerald-400">{formatCurrency(data.income)}</td>
                                <td className="px-6 py-3.5 font-mono text-red-400">{formatCurrency(data.expenses)}</td>
                                <td className={`px-6 py-3.5 font-mono font-semibold ${net >= 0 ? 'text-dynasty-gold' : 'text-red-400'}`}>
                                  {formatCurrency(net)}
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tax Summary */}
              {reportType === 'tax_summary' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-dynasty-gold/20 bg-dynasty-gold/5 p-5">
                    <p className="text-xs uppercase tracking-wider text-dynasty-gray-400 mb-1">Total Tax-Deductible Expenses</p>
                    <p className="font-mono text-3xl font-semibold text-dynasty-gold">{formatCurrency(totalDeductible)}</p>
                    <p className="text-xs text-dynasty-gray-400 mt-1">
                      {taxDeductible.length} deductible transaction{taxDeductible.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <TransactionTable transactions={taxDeductible} title="Deductible Transactions" />
                </div>
              )}

              {/* Expense Breakdown */}
              {reportType === 'expense_breakdown' && (
                <CategoryTable
                  title="Expense Breakdown"
                  data={expenseByCategory}
                  total={totalExpenses}
                  color="red"
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
  color: 'emerald' | 'red'
  showBar?: boolean
}) {
  const sorted = Object.entries(data).sort(([, a], [, b]) => b - a)
  const colorClass = color === 'emerald' ? 'text-emerald-400' : 'text-red-400'
  const barClass = color === 'emerald' ? 'bg-emerald-500' : 'bg-red-500'

  return (
    <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 overflow-hidden">
      <div className="border-b border-dynasty-gray-700 px-6 py-4">
        <h3 className="font-serif text-lg font-semibold text-dynasty-cream">{title}</h3>
      </div>
      <div className="divide-y divide-dynasty-gray-800">
        {sorted.map(([category, amount]) => {
          const pct = total > 0 ? (amount / total) * 100 : 0
          return (
            <div key={category} className="flex items-center gap-4 px-6 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-dynasty-cream">{category}</span>
                  <span className={`font-mono text-sm font-semibold ${colorClass}`}>
                    {formatCurrency(amount)}
                  </span>
                </div>
                {showBar && (
                  <div className="h-1.5 w-full rounded-full bg-dynasty-gray-700 overflow-hidden">
                    <div
                      className={`h-full ${barClass} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
              <span className="text-xs text-dynasty-gray-400 w-10 text-right">
                {pct.toFixed(0)}%
              </span>
            </div>
          )
        })}
        <div className="flex items-center justify-between px-6 py-3 bg-dynasty-gray-800">
          <span className="text-sm font-semibold text-dynasty-cream">Total</span>
          <span className={`font-mono font-semibold ${colorClass}`}>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
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
    <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 overflow-hidden">
      <div className="border-b border-dynasty-gray-700 px-6 py-4">
        <h3 className="font-serif text-lg font-semibold text-dynasty-cream">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dynasty-gray-700">
              {['Date', 'Category', 'Description', 'Amount'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dynasty-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dynasty-gray-800">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-dynasty-gray-800/50 transition-colors">
                <td className="px-6 py-3 text-dynasty-gray-400 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                <td className="px-6 py-3"><Badge variant="secondary">{t.category}</Badge></td>
                <td className="px-6 py-3 text-dynasty-cream">{t.description ?? '—'}</td>
                <td className="px-6 py-3 font-mono text-dynasty-gold">{formatCurrency(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
