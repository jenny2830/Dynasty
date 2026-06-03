import { createClient } from '@/lib/supabase/server'
import { ReportBuilder } from './ReportBuilder'
import { PageHeader } from '@/components/ui/page-header'
import { FeatureGate } from '@/components/FeatureGate'
import type { PlanId } from '@/lib/plans'

export const metadata = { title: 'Reports' }

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id, plan, free_trial_expired')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const plan = (landlord?.plan ?? 'free') as PlanId
  const trialExpired = landlord?.free_trial_expired ?? false

  const { data: properties } = landlord
    ? await supabase
        .from('properties')
        .select('id, name')
        .eq('landlord_id', landlord.id)
        .order('name')
    : { data: [] }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Reports"
        subtitle="Profit &amp; loss · Cash flow · Tax summaries · Expense breakdowns"
      />
      <FeatureGate feature="reports" plan={plan} trialExpired={trialExpired}>
        <ReportBuilder properties={properties ?? []} />
      </FeatureGate>
    </div>
  )
}
