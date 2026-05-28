import Link from 'next/link'
import { Plus, Building2, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { formatCurrency } from '@/lib/utils'

export const metadata = { title: 'Properties' }

const statusColors = {
  active: 'success',
  vacant: 'warning',
  inactive: 'secondary',
} as const

export default async function PropertiesPage() {
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

  const { data: properties } = landlord
    ? await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', landlord.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const count = properties?.length ?? 0

  return (
    <div className="space-y-7">
      <PageHeader
        title="Properties"
        subtitle={`${count} ${count === 1 ? 'estate' : 'estates'} in portfolio`}
      >
        <Button asChild>
          <Link href="/properties/new">
            <Plus /> Add Property
          </Link>
        </Button>
      </PageHeader>

      {!properties?.length ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-[2px] border border-dashed border-[rgba(201,168,76,0.18)] bg-dynasty-gray-900/40 px-6 py-16 text-center">
          <Building2
            className="h-8 w-8 text-dynasty-gold/15"
            strokeWidth={1}
          />
          <h2 className="mt-5 font-serif text-[22px] font-medium tracking-[0.04em] text-dynasty-gray-300">
            No properties yet
          </h2>
          <p className="mt-2 max-w-sm font-sans text-[12px] font-light tracking-[0.06em] text-dynasty-gray-500">
            Add your first property to start tracking income, expenses, and ROI.
          </p>
          <Button asChild variant="outline" className="mt-7">
            <Link href="/properties/new">
              <Plus /> Add Your First Property
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/properties/${p.id}`}
              className="group relative overflow-hidden rounded-[2px] border border-[rgba(201,168,76,0.1)] bg-[linear-gradient(135deg,#161616_0%,#1C1A17_100%)] px-6 py-6 shadow-[var(--shadow-card)] transition-all duration-300 ease-out hover:border-[rgba(201,168,76,0.35)] hover:shadow-[var(--shadow-card-hover)]"
            >
              {/* Top accent line */}
              <div
                className="pointer-events-none absolute top-0 left-[10%] right-[10%] h-px"
                style={{ background: 'var(--accent-top)' }}
                aria-hidden
              />
              {/* Corner glow */}
              <div
                className="pointer-events-none absolute top-0 left-0 h-[60px] w-[60px]"
                style={{ background: 'var(--accent-corner-tl)' }}
                aria-hidden
              />

              <div className="relative mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[1px] border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.06)]">
                    <Building2 className="h-4 w-4 text-dynasty-gold" strokeWidth={1.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-serif text-[16px] font-medium leading-tight tracking-[0.02em] text-dynasty-warm-white transition-colors group-hover:text-dynasty-gold">
                      {p.name}
                    </p>
                    <p className="mt-0.5 font-sans text-[10px] font-light uppercase tracking-[0.14em] text-dynasty-gray-500">
                      {p.type} &middot; {p.property_subtype}
                    </p>
                  </div>
                </div>
                <Badge variant={statusColors[p.status as keyof typeof statusColors] ?? 'secondary'}>
                  {p.status}
                </Badge>
              </div>

              <div className="relative mb-5 flex items-center gap-1.5 font-sans text-[11px] font-light tracking-[0.04em] text-dynasty-gray-500">
                <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.2} />
                <span className="truncate">
                  {p.address}, {p.city}, {p.province}
                </span>
              </div>

              <div className="relative grid grid-cols-2 gap-x-4 gap-y-3 pt-4 border-t border-[rgba(201,168,76,0.06)]">
                <div>
                  <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500">
                    Current Value
                  </p>
                  <p className="mt-1 font-mono text-[14px] font-medium text-dynasty-gold">
                    {p.current_value ? formatCurrency(p.current_value) : '—'}
                  </p>
                </div>
                <div>
                  <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500">
                    Units
                  </p>
                  <p className="mt-1 font-mono text-[14px] font-medium text-dynasty-warm-white">
                    {p.num_units}
                  </p>
                </div>
                {p.monthly_mortgage && (
                  <div>
                    <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500">
                      Monthly Mortgage
                    </p>
                    <p className="mt-1 font-mono text-[13px] font-light text-dynasty-cream">
                      {formatCurrency(p.monthly_mortgage)}
                    </p>
                  </div>
                )}
                {(p.condo_fee ?? p.strata_fee) && (
                  <div>
                    <p className="font-sans text-[9px] font-light uppercase tracking-[0.2em] text-dynasty-gray-500">
                      {p.type === 'condo' ? 'Condo Fee' : 'Strata Fee'}
                    </p>
                    <p className="mt-1 font-mono text-[13px] font-light text-dynasty-cream">
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
