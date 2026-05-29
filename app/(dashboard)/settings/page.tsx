import { PageHeader } from '@/components/ui/page-header'
import { SettingsPanel } from '@/components/settings/SettingsPanel'

export const metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        title="Settings"
        subtitle="Appearance · Security"
      />

      <SettingsPanel />
    </div>
  )
}
