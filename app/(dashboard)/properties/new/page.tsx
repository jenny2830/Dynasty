import { PropertyForm } from '@/components/properties/PropertyForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { getI18n } from '@/lib/i18n/server'

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t('properties.add') }
}

export default async function NewPropertyPage() {
  const { t } = await getI18n()
  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <Link
        href="/properties"
        className="inline-flex items-center gap-1.5 font-sans text-[10px] font-light uppercase tracking-[0.18em] text-dynasty-gray-400 transition-colors hover:text-dynasty-gold"
      >
        <ChevronLeft className="h-3 w-3" strokeWidth={1.2} /> {t('properties.backTo')}
      </Link>

      <PageHeader title={t('properties.add')} subtitle={t('properties.addSubtitle')} />

      <div className="rounded-[2px] border border-[var(--card-border-color)] px-9 py-9" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
        <PropertyForm mode="create" />
      </div>
    </div>
  )
}
