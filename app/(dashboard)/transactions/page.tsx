import Link from 'next/link'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Transactions' }

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-dynasty-cream">Transactions</h1>
          <p className="mt-1 text-sm text-dynasty-gray-400">Track all income and expenses</p>
        </div>
        <Button asChild>
          <Link href="/transactions/new">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] rounded-xl border border-dashed border-dynasty-gray-700">
        <ArrowLeftRight className="h-12 w-12 text-dynasty-gray-600 mb-4" strokeWidth={1} />
        <h2 className="font-serif text-xl text-dynasty-cream mb-2">No transactions yet</h2>
        <p className="text-sm text-dynasty-gray-400 mb-6 text-center max-w-sm">
          Log your first income or expense to start building your financial picture.
        </p>
        <Button asChild>
          <Link href="/transactions/new">
            <Plus className="h-4 w-4" />
            Add transaction
          </Link>
        </Button>
      </div>
    </div>
  )
}
