import { createClient } from '@/lib/supabase/server'
import { ReceiptScanner } from './ReceiptScanner'

export const metadata = { title: 'Receipt Scanner' }

export default async function ReceiptsPage() {
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
        .select('id, name')
        .eq('landlord_id', landlord.id)
        .order('name')
    : { data: [] }

  // Recent scanned receipts
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
      <div>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Receipt Scanner</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">
          AI-powered extraction using Claude Vision · Images are processed and immediately discarded
        </p>
      </div>

      <ReceiptScanner
        properties={properties ?? []}
        recentReceipts={recentReceipts ?? []}
      />
    </div>
  )
}
