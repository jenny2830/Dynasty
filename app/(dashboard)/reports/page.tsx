import { BarChart3 } from 'lucide-react'

export const metadata = { title: 'Reports' }

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Reports</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">
          P&amp;L, cash flow, tax summaries, and expense breakdowns
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] rounded-xl border border-dashed border-dynasty-gray-700">
        <BarChart3 className="h-12 w-12 text-dynasty-gray-600 mb-4" strokeWidth={1} />
        <h2 className="font-serif text-xl text-dynasty-cream mb-2">No reports yet</h2>
        <p className="text-sm text-dynasty-gray-400 text-center max-w-sm">
          Add transactions first to generate profit &amp; loss, tax summaries, and cash flow reports.
        </p>
      </div>
    </div>
  )
}
