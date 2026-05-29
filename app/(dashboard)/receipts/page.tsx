import { createClient } from '@/lib/supabase/server'
import { ReceiptScanner } from './ReceiptScanner'
import { PageHeader } from '@/components/ui/page-header'
import { FeatureGate } from '@/components/FeatureGate'
import type { PlanId } from '@/lib/plans'

export const metadata = { title: 'Receipt Scanner' }

export default async function ReceiptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id, plan, free_trial_expired')
    .eq('auth_user_id', user.id)
    .single()

  const plan = (landlord?.plan ?? 'free') as PlanId
  const trialExpired = landlord?.free_trial_expired ?? false

  const { data: properties } = landlord
    ? await supabase
        .from('properties')
        .select('id, name')
        .eq('landlord_id', landlord.id)
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Receipt Scanner"
        subtitle="AI extraction · Images processed and immediately discarded"
      />
      <FeatureGate feature="receiptScanner" plan={plan} trialExpired={trialExpired}>
        <ReceiptScanner
          properties={properties ?? []}
          recentReceipts={recentReceipts ?? []}
        />
      </FeatureGate>
    </div>
  )
}
