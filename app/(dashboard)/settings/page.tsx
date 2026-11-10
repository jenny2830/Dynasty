import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { hasActiveMembership } from '@/lib/plans'
import { getI18n } from '@/lib/i18n/server'

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t('meta.settings') }
}

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

  const { t } = await getI18n()

  return (
    <div className="space-y-7">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      <SettingsPanel isMember={isMember} />
    </div>
  )
}
