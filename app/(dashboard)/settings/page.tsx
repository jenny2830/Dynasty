import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { hasActiveMembership } from '@/lib/plans'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isMember = false

  if (user) {
    const { data: landlord } = await supabase
      .from('landlords')
      .select('plan, stripe_subscription_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (landlord) {
      isMember = hasActiveMembership(landlord)
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader title="Settings" subtitle="Appearance · Security · Billing" />
      <SettingsPanel isMember={isMember} />
    </div>
  )
}
