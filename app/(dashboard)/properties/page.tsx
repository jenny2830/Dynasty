import Link from 'next/link'
import { Plus, Building2, MapPin, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { formatCurrency } from '@/lib/utils'
import { PLAN_FEATURES, hasFeatureAccess } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Properties' }

const statusColors = {
  active: 'success',
  vacant: 'warning',
  inactive: 'secondary',
} as const

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: landlord, error: landlordError } = await supabase
    .from('landlords')
    .select('id, plan, free_trial_expired')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (landlordError) {
    console.error('[PropertiesPage] landlord fetch error:', landlordError)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-sans text-[12px] uppercase tracking-[0.3em]" style={{ color: 'var(--value-neg-c)' }}>
          Failed to load your account. Please refresh the page.
        </p>
      </div>
    )
  }

  if (!landlord) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-sans text-[12px] uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted-c)' }}>
          Landlord profile not found. Please complete your profile setup.
        </p>
      </div>
    )
  }

  const plan = (landlord?.plan ?? 'free') as PlanId
  const trialExpired = landlord?.free_trial_expired ?? false

  const { data: properties, error: propertiesError } = landlord
    ? await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', landlord.id)
        .order('created_at', { ascending: false })
    : { data: [], error: null }

  if (propertiesError) {
    console.error('[PropertiesPage] properties fetch error:', propertiesError)
  }

  const propertiesList = properties ?? []
  const count = propertiesList.length
  const maxProperties = PLAN_FEATURES[plan].maxProperties
  const canAdd = hasFeatureAccess(plan, 'transactions', trialExpired) &&
    (plan === 'free' ? !trialExpired && count < maxProperties : count < maxProperties)

  return (
    <div className="space-y-7">
      <PageHeader
        title="Properties"
        subtitle={`${count} ${count === 1 ? 'estate' : 'estates'} in portfolio`}
      >
        {canAdd ? (
          <Button asChild>
            <Link href="/properties/new">
              <Plus /> Add Property
            </Link>
          </Button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!trialExpired && plan !== 'free' && (
              <span style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '14px',
                letterSpacing: '0.12em',
                color: 'var(--text-muted-c)',
              }}>
                {count}/{maxProperties} properties
              </span>
            )}
            <Button asChild variant="outline">
              <Link href="/upgrade">
                <Lock style={{ width: '13px', height: '13px' }} />
                {trialExpired ? 'Upgrade to Add' : 'Upgrade Plan'}
              </Link>
            </Button>
          </div>
        )}
      </PageHeader>

      {propertiesError && (
        <div
          className="rounded-[2px] border px-5 py-3 font-sans text-[12px] tracking-[0.06em]"
          style={{ borderColor: 'var(--value-neg-c)', color: 'var(--value-neg-c)', background: 'rgba(183,110,121,0.06)' }}
        >
          Error loading properties. Please refresh the page.
        </div>
      )}

      {!propertiesList.length ? (
        <div
          className="flex min-h-[50vh] flex-col items-center justify-center rounded-[2px] border border-dashed px-6 py-16 text-center"
          style={{
            background: 'var(--section-bg)',
            borderColor: 'var(--card-border-color)',
          }}
        >
          <Building2 className="h-8 w-8" strokeWidth={1} style={{ color: 'var(--accent-c)', opacity: 0.15 }} />
          <h2
            className="mt-5 font-serif text-[22px] font-medium tracking-[0.04em]"
            style={{ color: 'var(--text-primary-c)' }}
          >
            No properties yet
          </h2>
          <p
            className="mt-2 max-w-sm font-sans text-[12px] font-light tracking-[0.06em]"
            style={{ color: 'var(--text-muted-c)' }}
          >
            Add your first property to start tracking income, expenses, and ROI.
          </p>
          {canAdd && (
            <Button asChild variant="outline" className="mt-7">
              <Link href="/properties/new">
                <Plus /> Add Your First Property
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {propertiesList.map((p) => (
            <Link
              key={p.id}
              href={`/properties/${p.id}`}
              className="group relative overflow-hidden rounded-[2px] transition-all duration-300 ease-out"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border-color)',
                boxShadow: 'var(--card-shadow)',
                padding: '24px',
                display: 'block',
              }}
            >
              <div className="pointer-events-none absolute top-0 left-[10%] right-[10%] h-px" style={{ background: 'var(--accent-line)' }} aria-hidden />
              <div className="pointer-events-none absolute top-0 left-0 h-[60px] w-[60px]" style={{ background: `radial-gradient(circle at top left, var(--corner-color) 0%, transparent 70%)` }} aria-hidden />

              <div className="relative mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[1px]"
                    style={{ border: '1px solid var(--icon-border-hi)', background: 'var(--icon-bg-hi)' }}
                  >
                    <Building2 className="h-4 w-4" strokeWidth={1.2} style={{ color: 'var(--accent-c)' }} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="truncate font-serif text-[16px] font-medium leading-tight tracking-[0.02em] transition-colors"
                      style={{ color: 'var(--text-primary-c)' }}
                    >
                      {p.name}
                    </p>
                    <p
                      className="mt-0.5 font-sans text-[10px] font-light uppercase tracking-[0.14em]"
                      style={{ color: 'var(--text-muted-c)' }}
                    >
                      {p.type} &middot; {p.property_subtype}
                    </p>
                  </div>
                </div>
                <Badge variant={statusColors[p.status as keyof typeof statusColors] ?? 'secondary'}>
                  {p.status}
                </Badge>
              </div>

              <div
                className="relative mb-5 flex items-center gap-1.5 font-sans text-[11px] font-light tracking-[0.04em]"
                style={{ color: 'var(--text-muted-c)' }}
              >
                <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.2} />
                <span className="truncate">{p.address}, {p.city}, {p.province}</span>
              </div>

              <div
                className="relative grid grid-cols-2 gap-x-4 gap-y-3 pt-4"
                style={{ borderTop: '1px solid var(--divider-c)' }}
              >
                <div>
                  <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted-c)' }}>
                    Current Value
                  </p>
                  <p className="mt-1 font-mono text-[14px] font-medium" style={{ color: 'var(--accent-c)' }}>
                    {p.current_value ? formatCurrency(p.current_value) : '—'}
                  </p>
                </div>
                <div>
                  <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted-c)' }}>
                    Units
                  </p>
                  <p className="mt-1 font-mono text-[14px] font-medium" style={{ color: 'var(--text-primary-c)' }}>
                    {p.num_units}
                  </p>
                </div>
                {p.monthly_mortgage && (
                  <div>
                    <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted-c)' }}>
                      Monthly Mortgage
                    </p>
                    <p className="mt-1 font-mono text-[13px] font-light" style={{ color: 'var(--text-secondary-c)' }}>
                      {formatCurrency(p.monthly_mortgage)}
                    </p>
                  </div>
                )}
                {(p.condo_fee ?? p.strata_fee) && (
                  <div>
                    <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted-c)' }}>
                      {p.type === 'condo' ? 'Condo Fee' : 'Strata Fee'}
                    </p>
                    <p className="mt-1 font-mono text-[13px] font-light" style={{ color: 'var(--text-secondary-c)' }}>
                      {formatCurrency(p.condo_fee ?? p.strata_fee ?? 0)}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
