import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PropertyForm } from '@/components/properties/PropertyForm'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = { title: 'Edit Property' }

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !property) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <Link
        href={`/properties/${id}`}
        className="inline-flex items-center gap-1.5 font-sans text-[10px] font-light uppercase tracking-[0.18em] text-dynasty-gray-400 transition-colors hover:text-dynasty-gold"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.2} /> Back to Property
      </Link>

      <PageHeader title="Edit Property" subtitle={property.name} />

      <div className="rounded-[2px] border border-[rgba(201,168,76,0.08)] bg-dynasty-black-soft px-9 py-9 shadow-[var(--shadow-card)]">
        <PropertyForm mode="edit" property={property} />
      </div>
    </div>
  )
}
