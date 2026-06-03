import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RecurringForm } from '../../RecurringForm'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = { title: 'Edit Recurring Payment' }

export default async function EditRecurringPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!landlord) return null

  const [paymentResult, propertiesResult] = await Promise.all([
    supabase
      .from('recurring_payments')
      .select('*')
      .eq('id', id)
      .eq('landlord_id', landlord.id)
      .single(),
    supabase
      .from('properties')
      .select('id, name')
      .eq('landlord_id', landlord.id)
      .order('name'),
  ])

  if (paymentResult.error || !paymentResult.data) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <Link
        href="/recurring"
        className="inline-flex items-center gap-1.5 font-sans text-[10px] font-light uppercase tracking-[0.18em] text-dynasty-gray-400 transition-colors hover:text-dynasty-gold"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.2} /> Back to Recurring
      </Link>

      <PageHeader
        title="Edit Recurring Payment"
        subtitle={paymentResult.data.name}
      />

      <div
        className="rounded-[2px] border border-[var(--card-border-color)] px-9 py-9"
        style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <RecurringForm
          mode="edit"
          payment={paymentResult.data}
          properties={propertiesResult.data ?? []}
        />
      </div>
    </div>
  )
}
