import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { formatDate } from '@/lib/utils'
import { Building2, Plus, ArrowRight, Bell } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Overview',
}

async function getDashboardData(landlordId: string) {
  const supabase = await createClient()

  const [propertiesResult, transactionsResult, remindersResult] = await Promise.all([
    supabase
      .from('properties')
      .select('id, name, city, province, status, current_value, type, property_subtype')
      .eq('landlord_id', landlordId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('transactions')
      .select('id, type, amount, category, transaction_date, description')
      .eq('landlord_id', landlordId)
      .order('transaction_date', { ascending: false })
      .limit(6),
    supabase
      .from('reminders')
      .select('id, due_date, status, recurring_payments(name, amount, category)')
      .eq('landlord_id', landlordId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(5),
  ])

  return {
    properties: propertiesResult.data ?? [],
    transactions: transactionsResult.data ?? [],
    reminders: remindersResult.data ?? [],
  }
}

export default async function OverviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch landlord profile
  const { data: landlord } = await supabase
    .from('landlords')
    .select('id, full_name, plan')
    .eq('auth_user_id', user.id)
    .single()

  // New users without a profile yet
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

  const { properties, transactions, reminders } = await getDashboardData(landlord.id)

  // Aggregate stats
  const totalPortfolioValue = properties.reduce(
    (sum, p) => sum + (p.current_value ?? 0),
    0
  )

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: monthlyTransactions } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('landlord_id', landlord.id)
    .gte('transaction_date', monthStart)
    .lte('transaction_date', monthEnd)

  const monthlyIncome = (monthlyTransactions ?? [])
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const monthlyExpenses = (monthlyTransactions ?? [])
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  const monthlyNetIncome = monthlyIncome - monthlyExpenses

  const firstName = landlord.full_name.split(' ')[0]
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-dynasty-gray-400">
            {new Date().toLocaleDateString('en-CA', {
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
              <Plus className="h-4 w-4" />
              Transaction
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/properties/new">
              <Plus className="h-4 w-4" />
              Property
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <StatsCards
        totalPortfolioValue={totalPortfolioValue}
        monthlyNetIncome={monthlyNetIncome}
        activeProperties={properties.length}
        pendingReminders={reminders.length}
      />

      {/* Two-column section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent transactions */}
        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900">
          <div className="flex items-center justify-between border-b border-dynasty-gray-700 px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-dynasty-cream">
              Recent Transactions
            </h2>
            <Link
              href="/transactions"
              className="flex items-center gap-1 text-xs text-dynasty-gold hover:text-dynasty-gold-light transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-dynasty-gray-800">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-dynasty-gray-400">No transactions yet</p>
                <Button asChild variant="ghost" size="sm" className="mt-3">
                  <Link href="/transactions/new">Add first transaction</Link>
                </Button>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-dynasty-gray-800/50 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium text-dynasty-cream truncate">
                      {tx.description ?? tx.category}
                    </span>
                    <span className="text-xs text-dynasty-gray-400">
                      {formatDate(tx.transaction_date)}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-sm font-semibold ml-4 shrink-0 ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}$
                    {tx.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Properties + Reminders */}
        <div className="flex flex-col gap-6">
          {/* Properties */}
          <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900">
            <div className="flex items-center justify-between border-b border-dynasty-gray-700 px-6 py-4">
              <h2 className="font-serif text-lg font-semibold text-dynasty-cream">
                Properties
              </h2>
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
                  <Building2 className="h-8 w-8 text-dynasty-gray-600 mb-2" strokeWidth={1} />
                  <p className="text-sm text-dynasty-gray-400">No properties yet</p>
                  <Button asChild variant="ghost" size="sm" className="mt-2">
                    <Link href="/properties/new">Add property</Link>
                  </Button>
                </div>
              ) : (
                properties.slice(0, 3).map((property) => (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-dynasty-gray-800/50 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium text-dynasty-cream truncate">
                        {property.name}
                      </span>
                      <span className="text-xs text-dynasty-gray-400">
                        {property.city}, {property.province}
                      </span>
                    </div>
                    <Badge variant="default" className="ml-4 shrink-0 capitalize">
                      {property.type}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Reminders */}
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
                <div className="flex items-center gap-3 px-6 py-4">
                  <Bell className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                  <p className="text-sm text-dynasty-gray-400">
                    No pending reminders — you&apos;re all clear
                  </p>
                </div>
              ) : (
                reminders.map((reminder) => {
                  const payment = reminder.recurring_payments as {
                    name: string
                    amount: number
                    category: string
                  } | null
                  return (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between px-6 py-3.5"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium text-dynasty-cream truncate">
                          {payment?.name ?? 'Payment'}
                        </span>
                        <span className="text-xs text-dynasty-gray-400">
                          Due {formatDate(reminder.due_date)}
                        </span>
                      </div>
                      {payment?.amount && (
                        <span className="font-mono text-sm text-dynasty-gold ml-4 shrink-0">
                          ${payment.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
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
    </div>
  )
}
