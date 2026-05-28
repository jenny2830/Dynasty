import Link from 'next/link'
import { Plus, Building2, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Properties</h1>
          <p className="mt-1 text-sm text-dynasty-gray-400">
            {properties?.length ?? 0} propert{(properties?.length ?? 0) === 1 ? 'y' : 'ies'} in portfolio
          </p>
        </div>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="h-4 w-4" /> Add Property
          </Link>
        </Button>
      </div>

      {!properties?.length ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] rounded-xl border border-dashed border-dynasty-gray-700">
          <Building2 className="h-12 w-12 text-dynasty-gray-600 mb-4" strokeWidth={1} />
          <h2 className="font-serif text-xl text-dynasty-cream mb-2">No properties yet</h2>
          <p className="text-sm text-dynasty-gray-400 mb-6 text-center max-w-sm">
            Add your first property to start tracking income, expenses, and ROI.
          </p>
          <Button asChild>
            <Link href="/properties/new">
              <Plus className="h-4 w-4" /> Add your first property
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/properties/${p.id}`}
              className="group rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-5 transition-all hover:border-dynasty-gold/30 hover:bg-dynasty-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dynasty-gold/10 border border-dynasty-gold/20">
                    <Building2 className="h-4 w-4 text-dynasty-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-dynasty-cream leading-tight group-hover:text-dynasty-gold transition-colors">
                      {p.name}
                    </p>
                    <p className="text-xs text-dynasty-gray-400 capitalize">
                      {p.type} · {p.property_subtype}
                    </p>
                  </div>
                </div>
                <Badge variant={statusColors[p.status as keyof typeof statusColors] ?? 'secondary'}>
                  {p.status}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-dynasty-gray-400 mb-4">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {p.address}, {p.city}, {p.province}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-dynasty-gray-400">Current value</p>
                  <p className="font-mono text-sm font-semibold text-dynasty-gold">
                    {p.current_value ? formatCurrency(p.current_value) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dynasty-gray-400">Units</p>
                  <p className="font-mono text-sm font-semibold text-dynasty-cream">
                    {p.num_units}
                  </p>
                </div>
                {p.monthly_mortgage && (
                  <div>
                    <p className="text-xs text-dynasty-gray-400">Monthly mortgage</p>
                    <p className="font-mono text-sm text-dynasty-cream">
                      {formatCurrency(p.monthly_mortgage)}
                    </p>
                  </div>
                )}
                {(p.condo_fee ?? p.strata_fee) && (
                  <div>
                    <p className="text-xs text-dynasty-gray-400">
                      {p.type === 'condo' ? 'Condo fee' : 'Strata fee'}
                    </p>
                    <p className="font-mono text-sm text-dynasty-cream">
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
