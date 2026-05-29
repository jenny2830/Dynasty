import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { UpgradeClient } from './UpgradeClient'
import type { PlanId } from '@/lib/plans'

export const metadata = { title: 'Upgrade Plan' }

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan: PlanId = 'free'
  let sessionsUsed = 0
  let hasSubscription = false

  if (user) {
    const { data: landlord } = await supabase
      .from('landlords')
      .select('plan, sessions_used, stripe_customer_id, stripe_subscription_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (landlord) {
      currentPlan = (landlord.plan ?? 'free') as PlanId
      sessionsUsed = landlord.sessions_used ?? 0
      hasSubscription = !!landlord.stripe_subscription_id
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Upgrade Plan"
        subtitle="Choose the plan that grows with your portfolio"
      />
      <UpgradeClient
        currentPlan={currentPlan}
        sessionsUsed={sessionsUsed}
        hasSubscription={hasSubscription}
        success={params.success === 'true'}
        canceled={params.canceled === 'true'}
      />
    </div>
  )
}
