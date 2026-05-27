import { TrendingUp } from 'lucide-react'

export const metadata = { title: 'ROI Calculator' }

export default function ROIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">ROI Calculator</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">
          Cap rate, cash-on-cash return, gross &amp; net yield
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] rounded-xl border border-dashed border-dynasty-gray-700">
        <TrendingUp className="h-12 w-12 text-dynasty-gray-600 mb-4" strokeWidth={1} />
        <h2 className="font-serif text-xl text-dynasty-cream mb-2">ROI Calculator</h2>
        <p className="text-sm text-dynasty-gray-400 text-center max-w-sm">
          Calculate cap rate, cash-on-cash return, and equity growth across your portfolio.
        </p>
      </div>
    </div>
  )
}
