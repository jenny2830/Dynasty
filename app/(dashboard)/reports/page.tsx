import { createClient } from '@/lib/supabase/server'
import { ReportBuilder } from './ReportBuilder'
import { PageHeader } from '@/components/ui/page-header'

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
    <div className="space-y-7">
      <PageHeader
        title="Reports"
        subtitle="Profit &amp; loss · Cash flow · Tax summaries · Expense breakdowns"
      />
      <ReportBuilder properties={properties ?? []} />
    </div>
  )
}
