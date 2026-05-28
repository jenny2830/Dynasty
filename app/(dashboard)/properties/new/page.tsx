import { PropertyForm } from '@/components/properties/PropertyForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = { title: 'Add Property' }

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <Link
        href="/properties"
        className="inline-flex items-center gap-1.5 font-sans text-[10px] font-light uppercase tracking-[0.18em] text-dynasty-gray-400 transition-colors hover:text-dynasty-gold"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.2} /> Back to Properties
      </Link>

      <PageHeader title="Add Property" subtitle="Expand your portfolio" />

      <div className="rounded-[2px] border border-[rgba(201,168,76,0.08)] bg-dynasty-black-soft px-9 py-9 shadow-[var(--shadow-card)]">
        <PropertyForm mode="create" />
      </div>
    </div>
  )
}
