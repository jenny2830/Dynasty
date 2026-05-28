'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, MoreHorizontal, Power, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { markAsPaid, toggleRecurringActive, deleteRecurringPayment } from '@/app/actions/recurring'

interface RecurringPayment {
  id: string
  name: string
  category: string
  amount: number
  frequency: string
  next_due_date: string
  is_active: boolean
  auto_log_transaction: boolean
  properties: { name: string } | null
}

const frequencyLabels: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annual',
}

function getDueStatus(nextDue: string): { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(nextDue)
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Overdue', variant: 'destructive' }
  if (diffDays === 0) return { label: 'Due today', variant: 'warning' }
  if (diffDays <= 7) return { label: `Due in ${diffDays}d`, variant: 'warning' }
  return { label: formatDate(nextDue), variant: 'secondary' }
}

export function RecurringPaymentRow({ payment }: { payment: RecurringPayment }) {
  const [isPending, startTransition] = useTransition()
  const [showMenu, setShowMenu] = useState(false)
  const dueStatus = getDueStatus(payment.next_due_date)

  function handleMarkPaid() {
    startTransition(async () => {
      await markAsPaid(payment.id)
      setShowMenu(false)
    })
  }

  function handleToggleActive() {
    startTransition(async () => {
      await toggleRecurringActive(payment.id, !payment.is_active)
      setShowMenu(false)
    })
  }

  function handleDelete() {
    if (!confirm('Delete this recurring payment?')) return
    startTransition(async () => {
      await deleteRecurringPayment(payment.id)
    })
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-dynasty-gray-800/40 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-dynasty-cream">{payment.name}</span>
          <Badge variant="secondary">{payment.category}</Badge>
          {payment.auto_log_transaction && (
            <Badge variant="default" className="text-xs">Auto-log</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-dynasty-gray-400">
          <span>{(payment.properties as { name: string } | null)?.name ?? '—'}</span>
          <span>·</span>
          <span>{frequencyLabels[payment.frequency] ?? payment.frequency}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="font-mono text-sm font-semibold text-dynasty-gold">
            {formatCurrency(payment.amount)}
          </p>
          <Badge variant={dueStatus.variant} className="text-xs mt-1">
            {dueStatus.label}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="default"
            size="sm"
            onClick={handleMarkPaid}
            disabled={isPending || !payment.is_active}
            className="h-8 px-3 text-xs"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Paid
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-9 z-20 min-w-44 rounded-lg border border-dynasty-gray-700 bg-dynasty-gray-800 py-1 shadow-xl">
                  <Link
                    href={`/recurring/${payment.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-dynasty-cream hover:bg-dynasty-gray-700 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <button
                    onClick={handleToggleActive}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-dynasty-cream hover:bg-dynasty-gray-700 transition-colors"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {payment.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className="my-1 h-px bg-dynasty-gray-700" />
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-dynasty-gray-700 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
