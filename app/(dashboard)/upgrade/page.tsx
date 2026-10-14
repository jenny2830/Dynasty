import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { UpgradeClient } from './UpgradeClient'
import { hasActiveMembership } from '@/lib/plans'

export const metadata = { title: 'Membership' }

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isMember = false
  let sessionsUsed = 0
  let trialExpired = false

  if (user) {
    const { data: landlord } = await supabase
      .from('landlords')
      .select('plan, sessions_used, stripe_subscription_id, free_trial_expired')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (landlord) {
      isMember = hasActiveMembership(landlord)
      sessionsUsed = landlord.sessions_used ?? 0
      trialExpired = landlord.free_trial_expired ?? false
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dynasty Membership"
        subtitle="Unlock everything — one plan, all features, two billing options"
      />
      <UpgradeClient
        isMember={isMember}
        sessionsUsed={sessionsUsed}
        trialExpired={trialExpired}
        success={params.success === 'true'}
        canceled={params.canceled === 'true'}
      />
    </div>
  )
}
