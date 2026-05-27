import { RefreshCw } from 'lucide-react'

export const metadata = { title: 'Recurring Payments' }

export default function RecurringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Recurring Payments</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">Automated reminders for regular expenses</p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] rounded-xl border border-dashed border-dynasty-gray-700">
        <RefreshCw className="h-12 w-12 text-dynasty-gray-600 mb-4" strokeWidth={1} />
        <h2 className="font-serif text-xl text-dynasty-cream mb-2">No recurring payments</h2>
        <p className="text-sm text-dynasty-gray-400 text-center max-w-sm">
          Set up recurring payments for mortgage, insurance, and other regular expenses.
        </p>
      </div>
    </div>
  )
}
