import { createClient } from '@/lib/supabase/server'
import { ReportBuilder } from './ReportBuilder'

export const metadata = { title: 'Reports' }

export default async function ReportsPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Reports</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">
          P&amp;L, cash flow, tax summaries, and expense breakdowns
        </p>
      </div>
      <ReportBuilder properties={properties ?? []} />
    </div>
  )
}
