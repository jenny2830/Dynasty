import Link from 'next/link'
import { Plus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Properties' }

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Properties</h1>
          <p className="mt-1 text-sm text-dynasty-gray-400">Manage your property portfolio</p>
        </div>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] rounded-xl border border-dashed border-dynasty-gray-700">
        <Building2 className="h-12 w-12 text-dynasty-gray-600 mb-4" strokeWidth={1} />
        <h2 className="font-serif text-xl text-dynasty-cream mb-2">No properties yet</h2>
        <p className="text-sm text-dynasty-gray-400 mb-6 text-center max-w-sm">
          Add your first property to start tracking income, expenses, and ROI.
        </p>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="h-4 w-4" />
            Add your first property
          </Link>
        </Button>
      </div>
    </div>
  )
}
