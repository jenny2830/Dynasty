import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PropertyForm } from '@/components/properties/PropertyForm'

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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/properties/${id}`}
          className="flex items-center gap-1.5 text-sm text-dynasty-gray-400 hover:text-dynasty-cream transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back to property
        </Link>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Edit Property</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">{property.name}</p>
      </div>

      <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-6">
        <PropertyForm mode="edit" property={property} />
      </div>
    </div>
  )
}
