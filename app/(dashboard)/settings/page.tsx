import { Settings } from 'lucide-react'

export const metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Settings</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">
          Account, billing, and notification preferences
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] rounded-xl border border-dashed border-dynasty-gray-700">
        <Settings className="h-12 w-12 text-dynasty-gray-600 mb-4" strokeWidth={1} />
        <h2 className="font-serif text-xl text-dynasty-cream mb-2">Settings coming soon</h2>
        <p className="text-sm text-dynasty-gray-400 text-center max-w-sm">
          Profile management, billing, and notification settings will be available here.
        </p>
      </div>
    </div>
  )
}
