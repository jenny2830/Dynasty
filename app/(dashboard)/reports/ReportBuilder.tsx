'use client'

import { useState, useTransition } from 'react'
import {
  BarChart3,
  FileDown,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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
import { useAppTheme } from '@/lib/theme-context'

interface Property {
  id: string
  name: string
  city?: string | null
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
  const { theme } = useAppTheme()
  const [downloading, setDownloading] = useState(false)
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

  const handleDownloadPDF = async () => {
    if (!generated || transactions.length === 0) return
    setDownloading(true)

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPos = 0

      // ── HEADER ──
      pdf.setFillColor(10, 10, 10)
      pdf.rect(0, 0, pageWidth, 28, 'F')
      pdf.setTextColor(201, 168, 76)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('DYNASTY', pageWidth / 2, 12, { align: 'center' })
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Property Wealth Platform', pageWidth / 2, 18, { align: 'center' })
      pdf.setTextColor(138, 138, 130)
      pdf.setFontSize(8)
      pdf.text('dynasty-alpha.vercel.app', pageWidth / 2, 24, { align: 'center' })

      yPos = 36

      // ── REPORT TITLE ──
      pdf.setTextColor(20, 20, 20)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      const titles: Record<string, string> = {
        pl: 'Profit & Loss Statement',
        cash_flow: 'Cash Flow Report',
        tax_summary: 'Tax Summary Report',
        expense_breakdown: 'Expense Breakdown Report',
      }
      pdf.text(titles[reportType] || 'Financial Report', 14, yPos)
      yPos += 8

      // ── REPORT META ──
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
      const propertyLabel =
        propertyId === 'all'
          ? 'All Properties'
          : properties.find((p) => p.id === propertyId)?.name ?? 'Selected Property'
      pdf.text(`Property: ${propertyLabel}`, 14, yPos)
      yPos += 6
      pdf.text(`Period: ${dateStart} to ${dateEnd}`, 14, yPos)
      yPos += 6
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-CA')}`, 14, yPos)
      yPos += 10

      // ── DIVIDER ──
      pdf.setDrawColor(201, 168, 76)
      pdf.setLineWidth(0.5)
      pdf.line(14, yPos, pageWidth - 14, yPos)
      yPos += 8

      // ── SUMMARY CARDS ──
      const colW = (pageWidth - 28) / 3 - 4
      pdf.setFillColor(245, 240, 232)
      pdf.rect(14, yPos, colW, 22, 'F')
      pdf.rect(14 + colW + 4, yPos, colW, 22, 'F')
      pdf.rect(14 + (colW + 4) * 2, yPos, colW, 22, 'F')

      pdf.setFontSize(7)
      pdf.setTextColor(100, 100, 100)
      pdf.text('TOTAL INCOME', 16, yPos + 6)
      pdf.text('TOTAL EXPENSES', 16 + colW + 4, yPos + 6)
      pdf.text('NET INCOME', 16 + (colW + 4) * 2, yPos + 6)

      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(10, 10, 10)
      pdf.text(formatCurrency(totalIncome), 16, yPos + 16)
      pdf.text(formatCurrency(totalExpenses), 16 + colW + 4, yPos + 16)
      if (netIncome >= 0) {
        pdf.setTextColor(0, 120, 60)
      } else {
        pdf.setTextColor(183, 110, 121)
      }
      pdf.text(formatCurrency(netIncome), 16 + (colW + 4) * 2, yPos + 16)

      yPos += 30

      // ── TRANSACTIONS TABLE ──
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(20, 20, 20)
      pdf.setFontSize(11)
      pdf.text('Transactions', 14, yPos)
      yPos += 6

      autoTable(pdf, {
        startY: yPos,
        head: [['Date', 'Description', 'Property', 'Category', 'Type', 'Amount']],
        body: transactions.map((t) => [
          new Date(t.transaction_date).toLocaleDateString('en-CA'),
          t.description ?? '—',
          (t.properties as { name: string } | null)?.name ?? '—',
          t.category ?? '—',
          t.type === 'income' ? 'Income' : 'Expense',
          `${t.type === 'expense' ? '-' : '+'}${formatCurrency(t.amount)}`,
        ]),
        headStyles: {
          fillColor: [10, 10, 10],
          textColor: [201, 168, 76],
          fontSize: 8,
          fontStyle: 'bold',
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [40, 40, 40],
        },
        alternateRowStyles: { fillColor: [248, 245, 242] },
        columnStyles: { 5: { halign: 'right' } },
        margin: { left: 14, right: 14 },
      })

      // ── TAX SUMMARY extra table ──
      if (reportType === 'tax_summary') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalY = (pdf as any).lastAutoTable?.finalY ?? yPos + 20

        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(20, 20, 20)
        pdf.text('Tax Deductible Expenses by Category', 14, finalY + 12)

        const deductibleByCategory = expenses
          .filter((t) => t.is_tax_deductible)
          .reduce<Record<string, number>>((acc, t) => {
            acc[t.category] = (acc[t.category] ?? 0) + t.amount
            return acc
          }, {})

        autoTable(pdf, {
          startY: finalY + 18,
          head: [['Expense Category', 'Total Amount', 'Tax Deductible']],
          body: Object.entries(deductibleByCategory).map(([cat, amount]) => [
            cat,
            formatCurrency(amount),
            'Yes',
          ]),
          headStyles: { fillColor: [10, 10, 10], textColor: [201, 168, 76], fontSize: 8 },
          bodyStyles: { fontSize: 8 },
          margin: { left: 14, right: 14 },
        })
      }

      // ── FOOTER on every page ──
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(7)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `Page ${i} of ${totalPages} · DYNASTY Property Wealth Platform · dynasty-alpha.vercel.app`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' },
        )
      }

      pdf.save(`dynasty-${reportType}-${dateStart}-${dateEnd}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF generation failed. Please try again.')
    } finally {
      setDownloading(false)
    }
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
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}{p.city ? ` — ${p.city}` : ''}
                  </SelectItem>
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
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 no-print" style={{ borderBottom: `1px solid ${theme.dividerColor}` }}>
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <FileDown /> CSV
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadPDF}
                disabled={downloading}
                style={{ opacity: downloading ? 0.7 : 1 }}
              >
                <FileDown /> {downloading ? 'Generating…' : 'Download PDF'}
              </Button>
            </div>
          </div>

          <div
            style={{
              padding: '32px',
              background: theme.pageBg ?? '#0A0A0A',
            }}
          >
            <div className="mb-6 pb-4" style={{ borderBottom: `1px solid ${theme.dividerColor}` }}>
              <h2 className="font-serif text-[22px] font-semibold tracking-[0.04em] text-dynasty-warm-white">
                {reportTypeLabel} Report
              </h2>
              <p className="mt-1 font-sans text-[11px] font-light uppercase tracking-[0.14em] text-dynasty-gray-500">
                {dateStart && dateEnd
                  ? `${formatDate(dateStart)} — ${formatDate(dateEnd)}`
                  : ''}
              </p>
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
                      { label: 'Total Income', value: totalIncome, isNeg: false, icon: TrendingUp },
                      { label: 'Total Expenses', value: totalExpenses, isNeg: true, icon: TrendingDown },
                      { label: 'Net Income', value: netIncome, isNeg: netIncome < 0, icon: Minus },
                    ].map(({ label, value, isNeg, icon: Icon }) => (
                      <div
                        key={label}
                        className="relative overflow-hidden rounded-[2px] px-6 py-5"
                        style={{
                          background: theme.cardBg,
                          border: theme.cardBorder,
                          boxShadow: theme.cardShadow,
                        }}
                      >
                        <div
                          className="pointer-events-none absolute top-0 left-[10%] right-[10%] h-px"
                          style={{ background: theme.topLine }}
                        />
                        <div className="flex items-center justify-between">
                          <p className="flex items-center gap-2 font-sans text-[9px] font-light uppercase tracking-[0.22em]" style={{ color: theme.textMuted }}>
                            <span className="text-[6px] leading-none" style={{ color: theme.cornerMark }}>◆</span>
                            {label}
                          </p>
                          <Icon className="h-4 w-4" strokeWidth={1.2} style={{ color: isNeg ? theme.valueNegative : theme.accent }} />
                        </div>
                        <p className="mt-3 font-display text-[36px] leading-none tracking-[0.04em]" style={{ color: isNeg ? theme.valueNegative : theme.accent }}>
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
                      <thead style={{ background: theme.tableHeaderBg, borderBottom: `1px solid ${theme.dividerColor}` }}>
                        <tr>
                          {['Month', 'Income', 'Expenses', 'Net Cash Flow'].map((h) => (
                            <th
                              key={h}
                              className="px-6 py-3.5 text-left font-sans text-[9px] font-light uppercase tracking-[0.2em]"
                              style={{ color: theme.textMuted }}
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
                              <tr key={month} className="transition-colors" style={{ borderBottom: `1px solid ${theme.tableRowBorder}` }}>
                                <td className="px-6 py-3.5 font-sans text-[13px]" style={{ color: theme.textPrimary }}>
                                  {format(new Date(month + '-01'), 'MMMM yyyy')}
                                </td>
                                <td className="px-6 py-3.5 font-mono text-[13px] font-medium" style={{ color: theme.accent }}>
                                  {formatCurrency(data.income)}
                                </td>
                                <td className="px-6 py-3.5 font-mono text-[13px] font-medium" style={{ color: theme.valueNegative }}>
                                  {formatCurrency(data.expenses)}
                                </td>
                                <td className="px-6 py-3.5 font-mono text-[13px] font-medium" style={{ color: net >= 0 ? theme.accent : theme.valueNegative }}>
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
                  <div
                    className="relative overflow-hidden rounded-[2px] px-7 py-6"
                    style={{ background: theme.cardBg, border: theme.cardBorder, boxShadow: theme.cardShadow }}
                  >
                    <div
                      className="pointer-events-none absolute top-0 left-[10%] right-[10%] h-px"
                      style={{ background: theme.topLine }}
                    />
                    <p className="flex items-center gap-2 font-sans text-[9px] font-light uppercase tracking-[0.22em]" style={{ color: theme.textMuted }}>
                      <span className="text-[6px] leading-none" style={{ color: theme.cornerMark }}>◆</span>
                      Total Tax-Deductible Expenses
                    </p>
                    <p className="mt-3 font-display text-[48px] leading-none tracking-[0.04em]" style={{ color: theme.accent }}>
                      {formatCurrency(totalDeductible)}
                    </p>
                    <p className="mt-2 font-sans text-[11px] font-light tracking-[0.06em]" style={{ color: theme.textMuted }}>
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
  const { theme } = useAppTheme()
  const sorted = Object.entries(data).sort(([, a], [, b]) => b - a)
  const valueColor = color === 'gold' ? theme.accent : theme.valueNegative
  const barBg = color === 'gold' ? theme.accent : theme.valueNegative

  return (
    <Section>
      <SectionHeader title={title} />
      <div style={{ borderTop: `1px solid ${theme.dividerColor}` }}>
        {sorted.map(([category, amount]) => {
          const pct = total > 0 ? (amount / total) * 100 : 0
          return (
            <div key={category} className="flex items-center gap-4 px-7 py-3.5" style={{ borderBottom: `1px solid ${theme.tableRowBorder}` }}>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-sans text-[13px]" style={{ color: theme.textPrimary }}>
                    {category}
                  </span>
                  <span className="font-mono text-[13px] font-medium" style={{ color: valueColor }}>
                    {formatCurrency(amount)}
                  </span>
                </div>
                {showBar && (
                  <div className="h-[2px] w-full overflow-hidden" style={{ background: theme.tableRowBorder }}>
                    <div className="h-full" style={{ width: `${pct}%`, background: barBg }} />
                  </div>
                )}
              </div>
              <span className="w-10 text-right font-mono text-[11px] font-light" style={{ color: theme.textMuted }}>
                {pct.toFixed(0)}%
              </span>
            </div>
          )
        })}
        <div
          className="flex items-center justify-between px-7 py-3.5"
          style={{ background: `${theme.accent}0A` }}
        >
          <span className="font-sans text-[12px] font-light uppercase tracking-[0.18em]" style={{ color: theme.textPrimary }}>
            Total
          </span>
          <span className="font-mono text-[14px] font-medium" style={{ color: valueColor }}>
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
  const { theme } = useAppTheme()
  return (
    <Section>
      <SectionHeader title={title} />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: theme.tableHeaderBg, borderBottom: `1px solid ${theme.dividerColor}` }}>
            <tr>
              {['Date', 'Category', 'Description', 'Amount'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3.5 text-left font-sans text-[9px] font-light uppercase tracking-[0.2em]"
                  style={{ color: theme.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="transition-colors" style={{ borderBottom: `1px solid ${theme.tableRowBorder}` }}>
                <td className="whitespace-nowrap px-6 py-3 font-sans text-[12px] font-light" style={{ color: theme.textSecondary }}>
                  {formatDate(t.transaction_date)}
                </td>
                <td className="px-6 py-3">
                  <Badge>{t.category}</Badge>
                </td>
                <td className="px-6 py-3 font-sans text-[13px]" style={{ color: theme.textPrimary }}>
                  {t.description ?? '—'}
                </td>
                <td className="px-6 py-3 font-mono text-[13px] font-medium" style={{ color: theme.accent }}>
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
