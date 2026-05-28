import { createClient } from '@/lib/supabase/server'
import { ROICalculator } from './ROICalculator'

export const metadata = { title: 'ROI Calculator' }

export default async function ROIPage() {
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
        .select('id, name, purchase_price, current_value, mortgage_balance, monthly_mortgage, condo_fee, strata_fee')
        .eq('landlord_id', landlord.id)
        .order('name')
    : { data: [] }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">ROI Calculator</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">
          Cap rate, cash-on-cash return, yield, and equity analysis
        </p>
      </div>
      <ROICalculator properties={properties ?? []} />
    </div>
  )
}
