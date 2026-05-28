import { PropertyForm } from '@/components/properties/PropertyForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Add Property' }

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/properties"
          className="flex items-center gap-1.5 text-sm text-dynasty-gray-400 hover:text-dynasty-cream transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back to properties
        </Link>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Add Property</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">
          Add a new property to your portfolio
        </p>
      </div>

      <div className="rounded-xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-6">
        <PropertyForm mode="create" />
      </div>
    </div>
  )
}
