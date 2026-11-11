import { createClient } from '@/lib/supabase/server'
import { ReceiptScanner } from './ReceiptScanner'
import { PageHeader } from '@/components/ui/page-header'
import { FeatureGate } from '@/components/FeatureGate'
import { hasActiveMembership } from '@/lib/plans'
import { getI18n } from '@/lib/i18n/server'

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t('meta.receipts') }
}

export default async function ReceiptsPage() {
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
        .select('id, name, address, city')
        .eq('landlord_id', landlord.id)
        .eq('status', 'active')
        .order('name')
    : { data: [] }

  const { data: recentReceipts } = landlord
    ? await supabase
        .from('receipts')
        .select('id, vendor_name, amount, receipt_date, category, status, ai_confidence')
        .eq('landlord_id', landlord.id)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const { t } = await getI18n()

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('receipts.title')}
        subtitle={t('receipts.subtitle')}
      />
      <FeatureGate isMember={isMember} featureLabel={t('receipts.title')}>
        <ReceiptScanner
          properties={properties ?? []}
          recentReceipts={recentReceipts ?? []}
        />
      </FeatureGate>
    </div>
  )
}
