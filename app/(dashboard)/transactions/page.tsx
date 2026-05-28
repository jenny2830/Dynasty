import Link from 'next/link'
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  // Build query with filters
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Transactions</h1>
          <p className="mt-1 text-sm text-dynasty-gray-400">
            {txList.length} transaction{txList.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/transactions/new">
            <Plus className="h-4 w-4" /> Add Transaction
          </Link>
        </Button>
      </div>

      {/* Running totals */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-4">
          <p className="text-xs uppercase tracking-wider text-dynasty-gray-400">Total Income</p>
          <p className="font-mono text-xl font-semibold text-emerald-400 mt-1">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-4">
          <p className="text-xs uppercase tracking-wider text-dynasty-gray-400">Total Expenses</p>
          <p className="font-mono text-xl font-semibold text-red-400 mt-1">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-4">
          <p className="text-xs uppercase tracking-wider text-dynasty-gray-400">Net Income</p>
          <p className={`font-mono text-xl font-semibold mt-1 ${netIncome >= 0 ? 'text-dynasty-gold' : 'text-red-400'}`}>
            {formatCurrency(netIncome)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters properties={propertiesResult.data ?? []} />

      {/* Table */}
      <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 overflow-hidden">
        {txList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-dynasty-gray-400 mb-4">No transactions found</p>
            <Button asChild size="sm">
              <Link href="/transactions/new">
                <Plus className="h-4 w-4" /> Add transaction
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dynasty-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dynasty-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dynasty-gray-400">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dynasty-gray-400 hidden sm:table-cell">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-dynasty-gray-400">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-dynasty-gray-400">
                    Amount
                  </th>
                  <th className="px-6 py-3 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-dynasty-gray-800">
                {txList.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-dynasty-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-3.5 text-dynasty-gray-400 whitespace-nowrap">
                      {formatDate(tx.transaction_date)}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 text-red-400 shrink-0" />
                        )}
                        <span className="text-dynasty-cream truncate max-w-48">
                          {tx.description ?? tx.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-dynasty-gray-400 hidden sm:table-cell whitespace-nowrap">
                      {(tx.properties as unknown as { name: string } | null)?.name ?? '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="secondary">{tx.category}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        href={`/transactions/${tx.id}/edit`}
                        className="text-xs text-dynasty-gray-400 hover:text-dynasty-gold transition-colors"
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
