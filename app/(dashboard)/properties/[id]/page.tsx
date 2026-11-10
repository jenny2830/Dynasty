import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Section, SectionHeader } from '@/components/ui/section'
import { formatCurrency, formatPropertyCurrency, formatDate } from '@/lib/utils'
import { getI18n } from '@/lib/i18n/server'
import { categoryLabel, enumLabel } from '@/lib/i18n/labels'
import { ChevronLeft, Edit, MapPin } from 'lucide-react'
import { DeletePropertyButton } from './DeletePropertyButton'
import { UnitManager } from './UnitManager'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('properties').select('name').eq('id', id).single()
  const { t } = await getI18n()
  return { title: data?.name ?? t('properties.propertyFallback') }
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

  const { t, locale } = await getI18n()
  const propertyCurrency = property.currency ?? 'CAD'

  return (
    <div className="space-y-7">
      {/* Back link */}
      <Link
        href="/properties"
        className="inline-flex items-center gap-1.5 font-sans text-[10px] font-light uppercase tracking-[0.18em] text-dynasty-gray-400 transition-colors hover:text-dynasty-gold"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.2} /> {t('properties.backTo')}
      </Link>

      {/* Header */}
      <header className="mb-2 pb-5 border-b border-[var(--divider-c)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="flex items-center gap-3 font-serif text-[30px] font-semibold leading-tight tracking-[0.04em] text-dynasty-warm-white">
                <span className="text-[10px] text-dynasty-gold/70 leading-none">◆</span>
                <span className="truncate">{property.name}</span>
              </h1>
              <Badge variant={property.status === 'active' ? 'success' : 'secondary'}>
                {enumLabel(property.status, t)}
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
              <Badge variant="outline">{enumLabel(property.type, t)}</Badge>
              <Badge variant="outline">{enumLabel(property.property_subtype, t)}</Badge>
              <Badge variant="outline">
                {property.num_units === 1
                  ? t('properties.unitCountOne', { count: property.num_units })
                  : t('properties.unitCountMany', { count: property.num_units })}
              </Badge>
            </div>
            <div className="mt-3.5 h-px w-10 bg-[var(--accent-c)] opacity-50" aria-hidden />
          </div>
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/properties/${id}/edit`}>
                <Edit /> {t('common.edit')}
              </Link>
            </Button>
            <DeletePropertyButton propertyId={id} />
          </div>
        </div>
      </header>

      {/* Financial stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('properties.purchasePrice'), value: property.purchase_price ? formatPropertyCurrency(property.purchase_price, propertyCurrency, locale) : '—', accent: false },
          { label: t('properties.currentValue'), value: property.current_value ? formatPropertyCurrency(property.current_value, propertyCurrency, locale) : '—', accent: true },
          { label: t('properties.mortgageBalance'), value: property.mortgage_balance ? formatPropertyCurrency(property.mortgage_balance, propertyCurrency, locale) : '—', accent: false },
          { label: t('properties.equity'), value: equity ? formatPropertyCurrency(equity, propertyCurrency, locale) : '—', accent: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-[2px] px-5 py-5"
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
              className="flex items-center gap-2 font-sans text-[9px] font-light uppercase tracking-[0.22em]"
              style={{ color: 'var(--text-muted-c)' }}
            >
              <span className="text-[6px] leading-none" style={{ color: 'var(--diamond-color)' }}>◆</span>
              {stat.label}
            </p>
            <p
              className="mt-2.5 font-mono text-[18px] font-medium tracking-tight"
              style={{ color: stat.accent ? 'var(--accent-c)' : 'var(--text-primary-c)' }}
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
            {t('properties.monthlyCosts')}
          </h2>
          <div className="flex flex-wrap gap-8">
            {property.monthly_mortgage && (
              <div>
                <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                  {t('properties.mortgage')}
                </p>
                <p className="mt-1 font-mono text-[14px] font-medium text-dynasty-cream">
                  {formatPropertyCurrency(property.monthly_mortgage, propertyCurrency, locale)}
                  <span className="ml-1 text-dynasty-gray-500 font-light">{t('common.perMonth')}</span>
                </p>
              </div>
            )}
            {property.condo_fee && (
              <div>
                <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                  {t('properties.condoFee')}
                </p>
                <p className="mt-1 font-mono text-[14px] font-medium text-dynasty-cream">
                  {formatPropertyCurrency(property.condo_fee, propertyCurrency, locale)}
                  <span className="ml-1 text-dynasty-gray-500 font-light">{t('common.perMonth')}</span>
                </p>
              </div>
            )}
            {property.strata_fee && (
              <div>
                <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                  {t('properties.strataFee')}
                </p>
                <p className="mt-1 font-mono text-[14px] font-medium text-dynasty-cream">
                  {formatPropertyCurrency(property.strata_fee, propertyCurrency, locale)}
                  <span className="ml-1 text-dynasty-gray-500 font-light">{t('common.perMonth')}</span>
                </p>
              </div>
            )}
          </div>
        </Section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Units — interactive add/edit/delete */}
        <Section className="px-7 py-6">
          <UnitManager propertyId={id} initialUnits={units} />
        </Section>

        {/* Recent transactions */}
        <Section>
          <SectionHeader
            title={t('properties.transactions')}
            action={
              <Link
                href={`/transactions?property_id=${id}`}
                className="font-sans text-[10px] font-light uppercase tracking-[0.18em] text-[var(--accent-c)] transition-colors hover:opacity-80"
              >
                {t('common.viewAll')}
              </Link>
            }
          />
          <div className="flex gap-8 px-7 py-4 border-b border-[var(--divider-c)]">
            <div>
              <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                {t('common.income')}
              </p>
              <p className="mt-1 font-mono text-[14px] font-medium text-[var(--value-pos-c)]">
                {formatCurrency(income, 'CAD', 2, locale)}
              </p>
            </div>
            <div>
              <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                {t('overview.chartExpenses')}
              </p>
              <p className="mt-1 font-mono text-[14px] font-medium text-[var(--value-neg-c)]">
                {formatCurrency(expenses, 'CAD', 2, locale)}
              </p>
            </div>
            <div>
              <p className="font-sans text-[9px] font-light uppercase tracking-[0.22em] text-dynasty-gray-500">
                {t('properties.net')}
              </p>
              <p
                className="mt-1 font-mono text-[14px] font-medium"
                style={{ color: income - expenses >= 0 ? 'var(--value-pos-c)' : 'var(--value-neg-c)' }}
              >
                {formatCurrency(income - expenses, 'CAD', 2, locale)}
              </p>
            </div>
          </div>
          <div className="max-h-72 divide-y divide-[var(--divider-c)] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <p className="font-sans text-[12px] font-light text-dynasty-gray-500">
                  {t('properties.noTransactions')}
                </p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-7 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[13px] text-dynasty-warm-white">
                      {tx.description ?? categoryLabel(tx.category, t)}
                    </p>
                    <p className="mt-0.5 font-sans text-[11px] font-light text-dynasty-gray-500">
                      {formatDate(tx.transaction_date, locale)}
                    </p>
                  </div>
                  <span
                    className="ml-3 shrink-0 font-mono text-[13px] font-medium tracking-tight"
                    style={{ color: tx.type === 'income' ? 'var(--value-pos-c)' : 'var(--value-neg-c)' }}
                  >
                    {tx.type === 'income' ? '+' : '−'}
                    {formatCurrency(tx.amount, 'CAD', 2, locale)}
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
            {t('common.notes')}
          </h2>
          <p className="whitespace-pre-wrap font-sans text-[13px] font-light leading-relaxed text-dynasty-gray-300">
            {property.notes}
          </p>
        </Section>
      )}
    </div>
  )
}
