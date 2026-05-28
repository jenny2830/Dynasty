import Link from 'next/link'
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, format } from 'date-fns'

export const metadata = { title: 'Transactions' }

function getPeriodDates(period: string | null): { start: string; end: string } | null {
  if (!period || period === 'all') return null
  const now = new Date()
  switch (period) {
    case 'this_month':
      return {
        start: format(startOfMonth(now), 'yyyy-MM-dd'),
        end: format(endOfMonth(now), 'yyyy-MM-dd'),
      }
    case 'last_month': {
      const last = subMonths(now, 1)
      return {
        start: format(startOfMonth(last), 'yyyy-MM-dd'),
        end: format(endOfMonth(last), 'yyyy-MM-dd'),
      }
    }
    case 'this_quarter':
      return {
        start: format(startOfQuarter(now), 'yyyy-MM-dd'),
        end: format(endOfQuarter(now), 'yyyy-MM-dd'),
      }
    case 'this_year':
      return {
        start: format(startOfYear(now), 'yyyy-MM-dd'),
        end: format(endOfYear(now), 'yyyy-MM-dd'),
      }
    default:
      return null
  }
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    property_id?: string
    type?: string
    category?: string
    period?: string
  }>
}) {
  const filters = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!landlord) return null

  const [propertiesResult] = await Promise.all([
    supabase
      .from('properties')
      .select('id, name')
      .eq('landlord_id', landlord.id)
      .order('name'),
  ])

  let query = supabase
    .from('transactions')
    .select('id, type, amount, category, transaction_date, description, property_id, properties(name)')
    .eq('landlord_id', landlord.id)
    .order('transaction_date', { ascending: false })

  if (filters.property_id) query = query.eq('property_id', filters.property_id)
  if (filters.type && filters.type !== 'all') {
    const txType = filters.type as 'income' | 'expense'
    query = query.eq('type', txType)
  }
  if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category)

  const periodDates = getPeriodDates(filters.period ?? null)
  if (periodDates) {
    query = query.gte('transaction_date', periodDates.start).lte('transaction_date', periodDates.end)
  }

  const { data: transactions } = await query.limit(200)

  const txList = transactions ?? []
  const totalIncome = txList.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = txList.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netIncome = totalIncome - totalExpenses

  const totals = [
    { label: 'Total Income', value: totalIncome, color: 'text-dynasty-gold' },
    { label: 'Total Expenses', value: totalExpenses, color: 'text-dynasty-rose-gold' },
    {
      label: 'Net Income',
      value: netIncome,
      color: netIncome >= 0 ? 'text-dynasty-gold' : 'text-dynasty-rose-gold',
    },
  ]

  return (
    <div className="space-y-7">
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

      {/* Running totals */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {totals.map((t) => (
          <div
            key={t.label}
            className="relative overflow-hidden rounded-[2px] border border-[rgba(201,168,76,0.1)] bg-[linear-gradient(135deg,#161616_0%,#1C1A17_100%)] px-6 py-5 shadow-[var(--shadow-card)]"
          >
            <div
              className="pointer-events-none absolute top-0 left-[10%] right-[10%] h-px"
              style={{ background: 'var(--accent-top)' }}
              aria-hidden
            />
            <p className="flex items-center gap-2 font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
              <span className="text-[6px] text-[rgba(201,168,76,0.5)] leading-none">◆</span>
              {t.label}
            </p>
            <p className={`mt-2.5 font-mono text-[22px] font-medium tracking-tight ${t.color}`}>
              {formatCurrency(t.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <TransactionFilters properties={propertiesResult.data ?? []} />

      {/* Table */}
      <div className="overflow-hidden rounded-[2px] border border-[rgba(201,168,76,0.08)] bg-dynasty-gray-900 shadow-[var(--shadow-card)]">
        {txList.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="font-sans text-[12px] font-light text-dynasty-gray-500">
              No transactions found
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/transactions/new">
                <Plus /> Add Transaction
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dynasty-black border-b border-[rgba(201,168,76,0.1)]">
                <tr>
                  {['Date', 'Description', 'Property', 'Category', 'Amount', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-6 py-3.5 font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500 ${
                        h === 'Amount' ? 'text-right' : 'text-left'
                      } ${h === 'Property' ? 'hidden sm:table-cell' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txList.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-[rgba(255,255,255,0.025)] transition-colors hover:bg-[rgba(201,168,76,0.025)]"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5 font-sans text-[12px] font-light text-dynasty-gray-400">
                      {formatDate(tx.transaction_date)}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-dynasty-gold" strokeWidth={1.2} />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 shrink-0 text-dynasty-rose-gold" strokeWidth={1.2} />
                        )}
                        <span className="max-w-[16rem] truncate font-sans text-[13px] text-dynasty-warm-white">
                          {tx.description ?? tx.category}
                        </span>
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-6 py-3.5 font-sans text-[12px] font-light text-dynasty-gray-400 sm:table-cell">
                      {(tx.properties as unknown as { name: string } | null)?.name ?? '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge>{tx.category}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right">
                      <span
                        className={`font-mono text-[13px] font-medium tracking-tight ${
                          tx.type === 'income' ? 'text-dynasty-gold' : 'text-dynasty-rose-gold'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '−'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        href={`/transactions/${tx.id}/edit`}
                        className="font-sans text-[10px] font-light uppercase tracking-[0.18em] text-dynasty-gray-500 transition-colors hover:text-dynasty-gold"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
