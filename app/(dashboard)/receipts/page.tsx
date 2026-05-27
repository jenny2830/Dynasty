import { ScanLine } from 'lucide-react'

export const metadata = { title: 'Receipt Scanner' }

export default function ReceiptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Receipt Scanner</h1>
        <p className="mt-1 text-sm text-dynasty-gray-400">
          AI-powered receipt extraction — data only, images never stored
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] rounded-xl border border-dashed border-dynasty-gray-700">
        <ScanLine className="h-12 w-12 text-dynasty-gray-600 mb-4" strokeWidth={1} />
        <h2 className="font-serif text-xl text-dynasty-cream mb-2">Scan a receipt</h2>
        <p className="text-sm text-dynasty-gray-400 text-center max-w-sm">
          Upload a receipt image and Claude AI will extract the vendor, amount, date, and category automatically.
        </p>
      </div>
    </div>
  )
}
