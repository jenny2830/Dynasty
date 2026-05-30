import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { SettingsPanel } from '@/components/settings/SettingsPanel'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan: 'free' | 'starter' | 'landlord' | 'portfolio' = 'free'
  let hasSubscription = false

  if (user) {
    const { data: landlord } = await supabase
      .from('landlords')
      .select('plan, stripe_subscription_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (landlord) {
      currentPlan = landlord.plan ?? 'free'
      hasSubscription = !!landlord.stripe_subscription_id
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Settings"
        subtitle="Appearance · Security · Billing"
      />
      <SettingsPanel currentPlan={currentPlan} hasSubscription={hasSubscription} />
    </div>
  )
}
