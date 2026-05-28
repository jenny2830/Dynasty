import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ChevronLeft, Edit, MapPin, Building2, DollarSign } from 'lucide-react'
import { DeletePropertyButton } from './DeletePropertyButton'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('properties').select('name').eq('id', id).single()
  return { title: data?.name ?? 'Property' }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !property) notFound()

  const [unitsResult, recentTxResult] = await Promise.all([
    supabase
      .from('units')
      .select('*')
      .eq('property_id', id)
      .order('unit_number'),
    supabase
      .from('transactions')
      .select('id, type, amount, category, transaction_date, description')
      .eq('property_id', id)
      .order('transaction_date', { ascending: false })
      .limit(10),
  ])

  const units = unitsResult.data ?? []
  const transactions = recentTxResult.data ?? []

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  const equity =
    property.current_value && property.mortgage_balance
      ? property.current_value - property.mortgage_balance
      : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/properties"
          className="flex items-center gap-1.5 text-sm text-dynasty-gray-400 hover:text-dynasty-cream transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back to properties
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">
                {property.name}
              </h1>
              <Badge variant={property.status === 'active' ? 'success' : 'secondary'}>
                {property.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-dynasty-gray-400">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {property.address}, {property.city}, {property.province}
                {property.postal_code ? ` ${property.postal_code}` : ''}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="capitalize">{property.type}</Badge>
              <Badge variant="outline" className="capitalize">{property.property_subtype}</Badge>
              <Badge variant="outline">{property.num_units} unit{property.num_units !== 1 ? 's' : ''}</Badge>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link href={`/properties/${id}/edit`}>
                <Edit className="h-4 w-4" /> Edit
              </Link>
            </Button>
            <DeletePropertyButton propertyId={id} />
          </div>
        </div>
      </div>

      {/* Financial stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Purchase price', value: property.purchase_price ? formatCurrency(property.purchase_price) : '—', gold: false },
          { label: 'Current value', value: property.current_value ? formatCurrency(property.current_value) : '—', gold: true },
          { label: 'Mortgage balance', value: property.mortgage_balance ? formatCurrency(property.mortgage_balance) : '—', gold: false },
          { label: 'Equity', value: equity ? formatCurrency(equity) : '—', gold: true },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-4">
            <p className="text-xs text-dynasty-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className={`font-mono text-lg font-semibold mt-1 ${stat.gold ? 'text-dynasty-gold' : 'text-dynasty-cream'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly costs */}
      {(property.monthly_mortgage || property.condo_fee || property.strata_fee) && (
        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-5">
          <h2 className="font-serif text-lg font-semibold text-dynasty-cream mb-3">Monthly Costs</h2>
          <div className="flex flex-wrap gap-6">
            {property.monthly_mortgage && (
              <div>
                <p className="text-xs text-dynasty-gray-400">Mortgage</p>
                <p className="font-mono text-dynasty-cream">{formatCurrency(property.monthly_mortgage)}/mo</p>
              </div>
            )}
            {property.condo_fee && (
              <div>
                <p className="text-xs text-dynasty-gray-400">Condo fee</p>
                <p className="font-mono text-dynasty-cream">{formatCurrency(property.condo_fee)}/mo</p>
              </div>
            )}
            {property.strata_fee && (
              <div>
                <p className="text-xs text-dynasty-gray-400">Strata fee</p>
                <p className="font-mono text-dynasty-cream">{formatCurrency(property.strata_fee)}/mo</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Units */}
        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900">
          <div className="flex items-center justify-between border-b border-dynasty-gray-700 px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-dynasty-cream">Units</h2>
            <span className="text-xs text-dynasty-gray-400">{units.length} unit{units.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-dynasty-gray-800">
            {units.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Building2 className="h-8 w-8 text-dynasty-gray-600 mb-2" strokeWidth={1} />
                <p className="text-sm text-dynasty-gray-400">No units added yet</p>
              </div>
            ) : (
              units.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-dynasty-cream">Unit {u.unit_number}</p>
                    <p className="text-xs text-dynasty-gray-400">
                      {[
                        u.bedrooms && `${u.bedrooms} bed`,
                        u.bathrooms && `${u.bathrooms} bath`,
                        u.sqft && `${u.sqft} sqft`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="text-right">
                    {u.rent_amount && (
                      <p className="font-mono text-sm text-dynasty-gold">
                        {formatCurrency(u.rent_amount)}/mo
                      </p>
                    )}
                    <Badge
                      variant={u.status === 'occupied' ? 'success' : u.status === 'maintenance' ? 'warning' : 'secondary'}
                      className="mt-1"
                    >
                      {u.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900">
          <div className="flex items-center justify-between border-b border-dynasty-gray-700 px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-dynasty-cream">Transactions</h2>
            <Link
              href={`/transactions?property_id=${id}`}
              className="text-xs text-dynasty-gold hover:text-dynasty-gold-light transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="px-6 py-3 border-b border-dynasty-gray-800 flex gap-4">
            <div>
              <p className="text-xs text-dynasty-gray-400">Income</p>
              <p className="font-mono text-sm text-emerald-400">{formatCurrency(income)}</p>
            </div>
            <div>
              <p className="text-xs text-dynasty-gray-400">Expenses</p>
              <p className="font-mono text-sm text-red-400">{formatCurrency(expenses)}</p>
            </div>
            <div>
              <p className="text-xs text-dynasty-gray-400">Net</p>
              <p className={`font-mono text-sm font-semibold ${income - expenses >= 0 ? 'text-dynasty-gold' : 'text-red-400'}`}>
                {formatCurrency(income - expenses)}
              </p>
            </div>
          </div>
          <div className="divide-y divide-dynasty-gray-800 max-h-72 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-dynasty-gray-400">No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-dynasty-cream truncate">
                      {tx.description ?? tx.category}
                    </p>
                    <p className="text-xs text-dynasty-gray-400">{formatDate(tx.transaction_date)}</p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 font-mono text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {property.notes && (
        <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-5">
          <h2 className="font-serif text-lg font-semibold text-dynasty-cream mb-2">Notes</h2>
          <p className="text-sm text-dynasty-gray-400 whitespace-pre-wrap">{property.notes}</p>
        </div>
      )}
    </div>
  )
}
