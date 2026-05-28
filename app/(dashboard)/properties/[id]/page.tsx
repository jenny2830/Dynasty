import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Section, SectionHeader } from '@/components/ui/section'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ChevronLeft, Edit, MapPin, Building2 } from 'lucide-react'
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
    <div className="space-y-7">
      {/* Back link */}
      <Link
        href="/properties"
        className="inline-flex items-center gap-1.5 font-sans text-[10px] font-light uppercase tracking-[0.18em] text-dynasty-gray-400 transition-colors hover:text-dynasty-gold"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.2} /> Back to Properties
      </Link>

      {/* Header */}
      <header className="mb-2 pb-5 border-b border-[rgba(201,168,76,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="flex items-center gap-3 font-serif text-[30px] font-semibold leading-tight tracking-[0.04em] text-dynasty-warm-white">
                <span className="text-[10px] text-dynasty-gold/70 leading-none">◆</span>
                <span className="truncate">{property.name}</span>
              </h1>
              <Badge variant={property.status === 'active' ? 'success' : 'secondary'}>
                {property.status}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-1.5 font-sans text-[11px] font-light tracking-[0.06em] text-dynasty-gray-400">
              <MapPin className="h-3 w-3" strokeWidth={1.2} />
              <span>
                {property.address}, {property.city}, {property.province}
                {property.postal_code ? ` ${property.postal_code}` : ''}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">{property.type}</Badge>
              <Badge variant="outline">{property.property_subtype}</Badge>
              <Badge variant="outline">
                {property.num_units} unit{property.num_units !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="mt-3.5 h-px w-10 bg-dynasty-gold/50" aria-hidden />
          </div>
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/properties/${id}/edit`}>
                <Edit /> Edit
              </Link>
            </Button>
            <DeletePropertyButton propertyId={id} />
          </div>
        </div>
      </header>

      {/* Financial stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Purchase Price', value: property.purchase_price ? formatCurrency(property.purchase_price) : '—', gold: false },
          { label: 'Current Value', value: property.current_value ? formatCurrency(property.current_value) : '—', gold: true },
          { label: 'Mortgage Balance', value: property.mortgage_balance ? formatCurrency(property.mortgage_balance) : '—', gold: false },
          { label: 'Equity', value: equity ? formatCurrency(equity) : '—', gold: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-[2px] border border-[rgba(201,168,76,0.1)] bg-[linear-gradient(135deg,#161616_0%,#1C1A17_100%)] px-5 py-5 shadow-[var(--shadow-card)]"
          >
            <div
              className="pointer-events-none absolute top-0 left-[10%] right-[10%] h-px"
              style={{ background: 'var(--accent-top)' }}
              aria-hidden
            />
            <p className="flex items-center gap-2 font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
              <span className="text-[6px] text-[rgba(201,168,76,0.5)] leading-none">◆</span>
              {stat.label}
            </p>
            <p
              className={`mt-2.5 font-mono text-[18px] font-medium tracking-tight ${
                stat.gold ? 'text-dynasty-gold' : 'text-dynasty-warm-white'
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly costs */}
      {(property.monthly_mortgage || property.condo_fee || property.strata_fee) && (
        <Section variant="warm" className="px-6 py-5">
          <h2 className="mb-4 font-serif text-[18px] font-medium tracking-[0.02em] text-dynasty-warm-white">
            Monthly Costs
          </h2>
          <div className="flex flex-wrap gap-8">
            {property.monthly_mortgage && (
              <div>
                <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                  Mortgage
                </p>
                <p className="mt-1 font-mono text-[14px] font-medium text-dynasty-cream">
                  {formatCurrency(property.monthly_mortgage)}
                  <span className="ml-1 text-dynasty-gray-500 font-light">/mo</span>
                </p>
              </div>
            )}
            {property.condo_fee && (
              <div>
                <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                  Condo Fee
                </p>
                <p className="mt-1 font-mono text-[14px] font-medium text-dynasty-cream">
                  {formatCurrency(property.condo_fee)}
                  <span className="ml-1 text-dynasty-gray-500 font-light">/mo</span>
                </p>
              </div>
            )}
            {property.strata_fee && (
              <div>
                <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                  Strata Fee
                </p>
                <p className="mt-1 font-mono text-[14px] font-medium text-dynasty-cream">
                  {formatCurrency(property.strata_fee)}
                  <span className="ml-1 text-dynasty-gray-500 font-light">/mo</span>
                </p>
              </div>
            )}
          </div>
        </Section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Units */}
        <Section>
          <SectionHeader
            title="Units"
            action={
              <span className="font-sans text-[10px] font-light uppercase tracking-[0.18em] text-dynasty-gray-500">
                {units.length} {units.length === 1 ? 'unit' : 'units'}
              </span>
            }
          />
          <div className="divide-y divide-[rgba(255,255,255,0.025)]">
            {units.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Building2 className="h-7 w-7 text-dynasty-gold/15" strokeWidth={1} />
                <p className="mt-3 font-sans text-[12px] font-light text-dynasty-gray-500">
                  No units added yet
                </p>
              </div>
            ) : (
              units.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-7 py-4">
                  <div>
                    <p className="font-sans text-[13px] text-dynasty-warm-white">
                      Unit {u.unit_number}
                    </p>
                    <p className="mt-0.5 font-sans text-[11px] font-light text-dynasty-gray-500">
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
                      <p className="font-mono text-[13px] font-medium text-dynasty-gold">
                        {formatCurrency(u.rent_amount)}
                        <span className="text-dynasty-gray-500 font-light ml-1">/mo</span>
                      </p>
                    )}
                    <Badge
                      variant={
                        u.status === 'occupied'
                          ? 'success'
                          : u.status === 'maintenance'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="mt-1"
                    >
                      {u.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Section>

        {/* Recent transactions */}
        <Section>
          <SectionHeader
            title="Transactions"
            action={
              <Link
                href={`/transactions?property_id=${id}`}
                className="font-sans text-[10px] font-light uppercase tracking-[0.18em] text-dynasty-gold transition-colors hover:text-dynasty-gold-light"
              >
                View All
              </Link>
            }
          />
          <div className="flex gap-8 px-7 py-4 border-b border-[rgba(255,255,255,0.025)]">
            <div>
              <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                Income
              </p>
              <p className="mt-1 font-mono text-[14px] font-medium text-dynasty-gold">
                {formatCurrency(income)}
              </p>
            </div>
            <div>
              <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                Expenses
              </p>
              <p className="mt-1 font-mono text-[14px] font-medium text-dynasty-rose-gold">
                {formatCurrency(expenses)}
              </p>
            </div>
            <div>
              <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                Net
              </p>
              <p
                className={`mt-1 font-mono text-[14px] font-medium ${
                  income - expenses >= 0 ? 'text-dynasty-gold' : 'text-dynasty-rose-gold'
                }`}
              >
                {formatCurrency(income - expenses)}
              </p>
            </div>
          </div>
          <div className="max-h-72 divide-y divide-[rgba(255,255,255,0.025)] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <p className="font-sans text-[12px] font-light text-dynasty-gray-500">
                  No transactions yet
                </p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-7 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[13px] text-dynasty-warm-white">
                      {tx.description ?? tx.category}
                    </p>
                    <p className="mt-0.5 font-sans text-[11px] font-light text-dynasty-gray-500">
                      {formatDate(tx.transaction_date)}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 font-mono text-[13px] font-medium tracking-tight ${
                      tx.type === 'income' ? 'text-dynasty-gold' : 'text-dynasty-rose-gold'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '−'}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Section>
      </div>

      {property.notes && (
        <Section className="px-7 py-6">
          <h2 className="mb-3 font-serif text-[18px] font-medium tracking-[0.02em] text-dynasty-warm-white">
            Notes
          </h2>
          <p className="whitespace-pre-wrap font-sans text-[13px] font-light leading-relaxed text-dynasty-gray-300">
            {property.notes}
          </p>
        </Section>
      )}
    </div>
  )
}
