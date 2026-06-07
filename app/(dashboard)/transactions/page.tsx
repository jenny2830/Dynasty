import Link from 'next/link'
import { Plus, ArrowUpRight, ArrowDownRight, Building2, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import {
  startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter,
  startOfYear, endOfYear,
  subMonths, format,
} from 'date-fns'

export const metadata = { title: 'Transactions' }

type TxRow = {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  transaction_date: string
  description: string | null
  property_id: string | null
  properties: { name: string } | null
}

type Group = {
  key: string
  label: string
  txs: TxRow[]
  income: number
  expenses: number
}

function getPeriodDates(period: string | null): { start: string; end: string } | null {
  if (!period || period === 'all') return null
  const now = new Date()
  switch (period) {
    case 'this_month':
      return { start: format(startOfMonth(now), 'yyyy-MM-dd'), end: format(endOfMonth(now), 'yyyy-MM-dd') }
    case 'last_month': {
      const last = subMonths(now, 1)
      return { start: format(startOfMonth(last), 'yyyy-MM-dd'), end: format(endOfMonth(last), 'yyyy-MM-dd') }
    }
    case 'this_quarter':
      return { start: format(startOfQuarter(now), 'yyyy-MM-dd'), end: format(endOfQuarter(now), 'yyyy-MM-dd') }
    case 'this_year':
      return { start: format(startOfYear(now), 'yyyy-MM-dd'), end: format(endOfYear(now), 'yyyy-MM-dd') }
    default:
      return null
  }
}

function groupTransactions(txList: TxRow[], groupBy: string): Group[] {
  const byDate = (a: TxRow, b: TxRow) =>
    new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()

  const buildGroup = (key: string, txs: TxRow[]): Group => ({
    key,
    label: key,
    txs: [...txs].sort(byDate),
    income: txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expenses: txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  })

  if (groupBy === 'property') {
    const map = new Map<string, TxRow[]>()
    txList.forEach((tx) => {
      const key = (tx.properties as { name: string } | null)?.name ?? 'No Property'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(tx)
    })
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, txs]) => buildGroup(k, txs))
  }

  if (groupBy === 'category') {
    const map = new Map<string, TxRow[]>()
    txList.forEach((tx) => {
      if (!map.has(tx.category)) map.set(tx.category, [])
      map.get(tx.category)!.push(tx)
    })
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, txs]) => buildGroup(k, txs))
  }

  // 'none' — flat date order
  return [buildGroup('all', txList)]
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    property_id?: string
    type?: string
    category?: string
    period?: string
    group_by?: string
  }>
}) {
  const filters = await searchParams
  const groupBy = filters.group_by ?? 'property'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!landlord) return null

  const [propertiesResult] = await Promise.all([
    supabase.from('properties').select('id, name').eq('landlord_id', landlord.id).order('name'),
  ])

  let query = supabase
    .from('transactions')
    .select('id, type, amount, category, transaction_date, description, property_id, properties(name)')
    .eq('landlord_id', landlord.id)
    .order('transaction_date', { ascending: false })

  if (filters.property_id) query = query.eq('property_id', filters.property_id)
  if (filters.type && filters.type !== 'all') query = query.eq('type', filters.type as 'income' | 'expense')
  if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category)

  const periodDates = getPeriodDates(filters.period ?? null)
  if (periodDates) query = query.gte('transaction_date', periodDates.start).lte('transaction_date', periodDates.end)

  const { data: transactions } = await query.limit(500)
  const txList = (transactions ?? []) as unknown as TxRow[]

  const totalIncome = txList.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = txList.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netIncome = totalIncome - totalExpenses

  const groups = groupTransactions(txList, groupBy)
  const isGrouped = groupBy !== 'none'
  const GroupIcon = groupBy === 'category' ? Tag : Building2

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        subtitle={`${txList.length} ${txList.length === 1 ? 'transaction' : 'transactions'}`}
      >
        <Button asChild>
          <Link href="/transactions/new">
            <Plus /> Add Transaction
          </Link>
        </Button>
      </PageHeader>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {[
          { label: 'Total Income', value: totalIncome, isNeg: false },
          { label: 'Total Expenses', value: totalExpenses, isNeg: true },
          { label: 'Net Income', value: netIncome, isNeg: netIncome < 0 },
        ].map((t) => (
          <div
            key={t.label}
            className="relative overflow-hidden rounded-[2px] px-3 py-4 sm:px-6 sm:py-5"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border-color)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div
              className="pointer-events-none absolute top-0 left-[10%] right-[10%] h-px"
              style={{ background: 'var(--accent-line)' }}
              aria-hidden
            />
            <p
              className="flex items-center gap-1.5 font-sans text-[8px] sm:text-[9px] font-light uppercase tracking-[0.18em] sm:tracking-[0.22em]"
              style={{ color: 'var(--text-muted-c)' }}
            >
              <span className="hidden sm:inline text-[6px] leading-none" style={{ color: 'var(--diamond-color)' }}>◆</span>
              {t.label}
            </p>
            <p
              className="mt-1.5 sm:mt-2.5 font-mono text-[15px] sm:text-[22px] font-medium tracking-tight"
              style={{ color: t.isNeg ? 'var(--value-neg-c)' : 'var(--accent-c)' }}
            >
              {formatCurrency(t.value)}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <TransactionFilters properties={propertiesResult.data ?? []} />

      {/* ── Content ── */}
      {txList.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-[2px] px-6 py-16 text-center"
          style={{ background: 'var(--section-bg)', border: '1px solid var(--card-border-color)' }}
        >
          <p className="font-sans text-[12px] font-light" style={{ color: 'var(--text-muted-c)' }}>
            No transactions found
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/transactions/new"><Plus /> Add Transaction</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.key}
              className="overflow-hidden rounded-[2px]"
              style={{
                background: 'var(--section-bg)',
                border: '1px solid var(--card-border-color)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              {/* Group header — only shown when grouping is active */}
              {isGrouped && (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
                  style={{
                    background: 'var(--table-header-bg)',
                    borderBottom: '1px solid var(--card-border-color)',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GroupIcon
                      size={12}
                      strokeWidth={1.3}
                      style={{ color: 'var(--accent-c)', flexShrink: 0, opacity: 0.8 }}
                    />
                    <span
                      className="font-serif text-[16px] sm:text-[18px] font-medium tracking-[0.02em] truncate"
                      style={{ color: 'var(--text-primary-c)' }}
                    >
                      {group.label}
                    </span>
                    <span
                      className="font-sans text-[10px] font-light tracking-[0.1em]"
                      style={{ color: 'var(--text-muted-c)', flexShrink: 0 }}
                    >
                      {group.txs.length} tx
                    </span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                    {group.income > 0 && (
                      <div>
                        <p className="font-sans text-[8px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted-c)' }}>Income</p>
                        <p className="font-mono text-[12px] sm:text-[13px] font-medium" style={{ color: 'var(--accent-c)' }}>
                          +{formatCurrency(group.income)}
                        </p>
                      </div>
                    )}
                    {group.expenses > 0 && (
                      <div>
                        <p className="font-sans text-[8px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted-c)' }}>Expenses</p>
                        <p className="font-mono text-[12px] sm:text-[13px] font-medium" style={{ color: 'var(--value-neg-c)' }}>
                          −{formatCurrency(group.expenses)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="font-sans text-[8px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted-c)' }}>Net</p>
                      <p
                        className="font-mono text-[12px] sm:text-[13px] font-medium"
                        style={{ color: group.income - group.expenses >= 0 ? 'var(--accent-c)' : 'var(--value-neg-c)' }}
                      >
                        {group.income - group.expenses >= 0 ? '+' : '−'}
                        {formatCurrency(Math.abs(group.income - group.expenses))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Mobile card list (< md) ── */}
              <div className="md:hidden divide-y" style={{ borderColor: 'var(--divider-c)' }}>
                {group.txs.map((tx) => {
                  const propName = (tx.properties as { name: string } | null)?.name
                  return (
                    <Link
                      key={tx.id}
                      href={`/transactions/${tx.id}/edit`}
                      className="flex items-start gap-3 px-4 py-3.5 transition-colors"
                      style={{ display: 'flex', textDecoration: 'none' }}
                    >
                      {/* Type icon */}
                      <div
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[1px]"
                        style={{
                          background: tx.type === 'income'
                            ? 'var(--badge-pos-bg)'
                            : 'var(--badge-neg-bg)',
                          border: tx.type === 'income'
                            ? '1px solid var(--badge-pos-border)'
                            : '1px solid var(--badge-neg-border)',
                        }}
                      >
                        {tx.type === 'income' ? (
                          <ArrowUpRight size={13} strokeWidth={1.5} style={{ color: 'var(--accent-c)' }} />
                        ) : (
                          <ArrowDownRight size={13} strokeWidth={1.5} style={{ color: 'var(--value-neg-c)' }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className="truncate font-sans text-[13px] leading-snug"
                            style={{ color: 'var(--text-primary-c)' }}
                          >
                            {tx.description ?? tx.category}
                          </p>
                          <span
                            className="shrink-0 font-mono text-[13px] font-medium tracking-tight"
                            style={{ color: tx.type === 'income' ? 'var(--accent-c)' : 'var(--value-neg-c)' }}
                          >
                            {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-sans text-[11px] font-light" style={{ color: 'var(--text-muted-c)' }}>
                            {formatDate(tx.transaction_date)}
                          </span>
                          {propName && !isGrouped && (
                            <>
                              <span style={{ color: 'var(--divider-c)' }}>·</span>
                              <span className="font-sans text-[11px] font-light truncate max-w-[120px]" style={{ color: 'var(--text-muted-c)' }}>
                                {propName}
                              </span>
                            </>
                          )}
                          <span style={{ color: 'var(--divider-c)' }}>·</span>
                          <Badge className="text-[10px] py-0">{tx.category}</Badge>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* ── Desktop table (≥ md) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--card-border-color)' }}>
                    <tr>
                      {[
                        { label: 'Date', align: 'left', cls: '' },
                        { label: 'Description', align: 'left', cls: '' },
                        ...(groupBy !== 'property' ? [{ label: 'Property', align: 'left', cls: 'hidden lg:table-cell' }] : []),
                        ...(groupBy !== 'category' ? [{ label: 'Category', align: 'left', cls: '' }] : []),
                        { label: 'Amount', align: 'right', cls: '' },
                        { label: '', align: 'right', cls: '' },
                      ].map((h, i) => (
                        <th
                          key={i}
                          className={`px-5 py-3 font-sans text-[9px] font-light uppercase tracking-[0.2em] ${
                            h.align === 'right' ? 'text-right' : 'text-left'
                          } ${h.cls}`}
                          style={{ color: 'var(--text-muted-c)' }}
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.txs.map((tx) => {
                      const propName = (tx.properties as { name: string } | null)?.name
                      return (
                        <tr
                          key={tx.id}
                          className="group transition-colors hover:bg-[var(--table-row-hover-bg)]"
                          style={{ borderBottom: '1px solid var(--table-row-border-c)' }}
                        >
                          {/* Date */}
                          <td
                            className="whitespace-nowrap px-5 py-3.5 font-sans text-[12px] font-light"
                            style={{ color: 'var(--text-muted-c)' }}
                          >
                            {formatDate(tx.transaction_date)}
                          </td>

                          {/* Description */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[1px]"
                                style={{
                                  background: tx.type === 'income'
                                    ? 'var(--badge-pos-bg)'
                                    : 'var(--badge-neg-bg)',
                                }}
                              >
                                {tx.type === 'income' ? (
                                  <ArrowUpRight size={11} strokeWidth={1.5} style={{ color: 'var(--accent-c)' }} />
                                ) : (
                                  <ArrowDownRight size={11} strokeWidth={1.5} style={{ color: 'var(--value-neg-c)' }} />
                                )}
                              </span>
                              <span
                                className="max-w-[220px] truncate font-sans text-[13px]"
                                style={{ color: 'var(--text-primary-c)' }}
                              >
                                {tx.description ?? tx.category}
                              </span>
                            </div>
                          </td>

                          {/* Property — hidden when grouped by property */}
                          {groupBy !== 'property' && (
                            <td
                              className="hidden whitespace-nowrap px-5 py-3.5 font-sans text-[12px] font-light lg:table-cell"
                              style={{ color: 'var(--text-secondary-c)' }}
                            >
                              {propName ?? '—'}
                            </td>
                          )}

                          {/* Category — hidden when grouped by category */}
                          {groupBy !== 'category' && (
                            <td className="px-5 py-3.5">
                              <Badge>{tx.category}</Badge>
                            </td>
                          )}

                          {/* Amount */}
                          <td className="whitespace-nowrap px-5 py-3.5 text-right">
                            <span
                              className="font-mono text-[13px] font-medium tracking-tight"
                              style={{ color: tx.type === 'income' ? 'var(--accent-c)' : 'var(--value-neg-c)' }}
                            >
                              {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                            </span>
                          </td>

                          {/* Edit link */}
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              href={`/transactions/${tx.id}/edit`}
                              className="font-sans text-[10px] font-light uppercase tracking-[0.18em] opacity-0 transition-opacity group-hover:opacity-100"
                              style={{ color: 'var(--text-muted-c)' }}
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
