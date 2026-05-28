import { createClient } from '@/lib/supabase/server'
import { ROICalculator } from './ROICalculator'
import { PageHeader } from '@/components/ui/page-header'

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
    <div className="space-y-7">
      <PageHeader
        title="ROI Calculator"
        subtitle="Cap rate · Cash-on-cash · Yield · Equity analysis"
      />
      <ROICalculator properties={properties ?? []} />
    </div>
  )
}
