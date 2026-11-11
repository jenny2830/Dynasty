import { OverviewClient } from './OverviewClient'
import { getI18n } from '@/lib/i18n/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const { t } = await getI18n()
  return { title: t('meta.overview') }
}

export default function OverviewPage() {
  return <OverviewClient />
}
