import { createClient } from '@/lib/supabase/server'
import { ReportBuilder } from './ReportBuilder'
import { PageHeader } from '@/components/ui/page-header'
import { FeatureGate } from '@/components/FeatureGate'
import { hasActiveMembership } from '@/lib/plans'

export const metadata = { title: 'Reports' }

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id, plan, stripe_subscription_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const isMember = hasActiveMembership(landlord ?? {})

  const { data: properties } = landlord
    ? await supabase
        .from('properties')
        .select('id, name, city')
        .eq('landlord_id', landlord.id)
        .eq('status', 'active')
        .order('name')
    : { data: [] }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Reports"
        subtitle="Profit &amp; loss · Cash flow · Tax summaries · Expense breakdowns"
      />
      <FeatureGate isMember={isMember} featureLabel="Reports">
        <ReportBuilder properties={properties ?? []} />
      </FeatureGate>
    </div>
  )
}
