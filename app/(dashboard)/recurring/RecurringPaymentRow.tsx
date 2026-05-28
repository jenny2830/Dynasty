'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, MoreHorizontal, Power, Trash2, Edit } from 'lucide-react'
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

function getDueStatus(nextDue: string): {
  label: string
  variant: 'success' | 'warning' | 'destructive' | 'secondary'
} {
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
    <div className="flex items-center gap-4 px-7 py-4 transition-colors hover:bg-[rgba(201,168,76,0.025)]">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-[13px] text-dynasty-warm-white">{payment.name}</span>
          <Badge variant="secondary">{payment.category}</Badge>
          {payment.auto_log_transaction && <Badge>Auto-log</Badge>}
        </div>
        <div className="mt-1 flex items-center gap-3 font-sans text-[11px] font-light text-dynasty-gray-500">
          <span>{(payment.properties as { name: string } | null)?.name ?? '—'}</span>
          <span className="text-[rgba(201,168,76,0.4)]">·</span>
          <span>{frequencyLabels[payment.frequency] ?? payment.frequency}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <p className="font-mono text-[14px] font-medium tracking-tight text-dynasty-gold">
            {formatCurrency(payment.amount)}
          </p>
          <Badge variant={dueStatus.variant} className="mt-1">
            {dueStatus.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleMarkPaid}
            disabled={isPending || !payment.is_active}
          >
            <CheckCircle2 /> Paid
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.2} />
            </Button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-10 z-20 min-w-44 rounded-[1px] border border-[rgba(201,168,76,0.18)] bg-dynasty-black-card py-1 shadow-[var(--shadow-card)]">
                  <Link
                    href={`/recurring/${payment.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2.5 font-sans text-[11px] font-light uppercase tracking-[0.14em] text-dynasty-gray-300 transition-colors hover:bg-[rgba(201,168,76,0.06)] hover:text-dynasty-gold"
                    onClick={() => setShowMenu(false)}
                  >
                    <Edit className="h-3.5 w-3.5" strokeWidth={1.2} /> Edit
                  </Link>
                  <button
                    onClick={handleToggleActive}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 px-4 py-2.5 font-sans text-[11px] font-light uppercase tracking-[0.14em] text-dynasty-gray-300 transition-colors hover:bg-[rgba(201,168,76,0.06)] hover:text-dynasty-gold"
                  >
                    <Power className="h-3.5 w-3.5" strokeWidth={1.2} />
                    {payment.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className="my-1 h-px bg-[rgba(201,168,76,0.08)]" />
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 px-4 py-2.5 font-sans text-[11px] font-light uppercase tracking-[0.14em] text-dynasty-rose-gold transition-colors hover:bg-[rgba(183,110,121,0.06)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.2} /> Delete
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
