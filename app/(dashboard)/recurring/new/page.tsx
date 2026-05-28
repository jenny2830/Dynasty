import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RecurringForm } from '../RecurringForm'

export const metadata = { title: 'Add Recurring Payment' }

export default async function NewRecurringPage() {
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/recurring"
          className="flex items-center gap-1.5 text-sm text-dynasty-gray-400 hover:text-dynasty-cream transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back to recurring
        </Link>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Add Recurring Payment</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">Set up automatic reminders for regular expenses</p>
      </div>

      <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-6">
        <RecurringForm mode="create" properties={properties ?? []} />
      </div>
    </div>
  )
}
