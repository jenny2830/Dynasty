import { Settings as SettingsIcon } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        title="Settings"
        subtitle="Account · Billing · Notifications"
      />

      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-[2px] border border-dashed border-[rgba(201,168,76,0.18)] bg-dynasty-gray-900/40 px-6 py-16 text-center">
        <SettingsIcon className="h-8 w-8 text-dynasty-gold/15" strokeWidth={1} />
        <h2 className="mt-5 font-serif text-[22px] font-medium tracking-[0.04em] text-dynasty-gray-300">
          Settings coming soon
        </h2>
        <p className="mt-2 max-w-sm font-sans text-[12px] font-light tracking-[0.06em] text-dynasty-gray-500">
          Profile management, billing, and notification settings will be available here.
        </p>
      </div>
    </div>
  )
}
