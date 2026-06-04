'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { CheckCircle2, MoreHorizontal, Power, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { markAsPaid, toggleRecurringActive, deleteRecurringPayment } from '@/app/actions/recurring'

interface RecurringPayment {
  id: string
  landlord_id: string
  property_id: string
  name: string
  category: string
  amount: number
  frequency: string
  next_due_date: string
  is_active: boolean
  auto_log_transaction: boolean
  last_paid_date?: string | null
  properties: { name: string } | null
}

const frequencyLabels: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annual',
}

type PaymentStatus = 'scheduled' | 'pending' | 'paid'

function getPaymentStatus(payment: RecurringPayment): PaymentStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(payment.next_due_date)
  due.setHours(0, 0, 0, 0)

  // Check if paid this period — last_paid_date must be in the same month/year as the due date
  if (payment.last_paid_date) {
    const lastPaid = new Date(payment.last_paid_date)
    if (
      lastPaid.getMonth() === due.getMonth() &&
      lastPaid.getFullYear() === due.getFullYear()
    ) {
      return 'paid'
    }
  }

  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays > 0) return 'scheduled'
  return 'pending' // due today or overdue
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; color: string; border: string }> = {
  scheduled: {
    label: 'Scheduled',
    bg: 'rgba(201,168,76,0.08)',
    color: '#C9A84C',
    border: '1px solid rgba(201,168,76,0.25)',
  },
  pending: {
    label: 'Pending',
    bg: 'rgba(183,110,121,0.10)',
    color: '#B76E79',
    border: '1px solid rgba(183,110,121,0.30)',
  },
  paid: {
    label: 'Paid',
    bg: 'rgba(34,197,94,0.08)',
    color: '#16a34a',
    border: '1px solid rgba(34,197,94,0.25)',
  },
}

const BADGE_STYLE: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '3px 10px',
  borderRadius: '1px',
  display: 'inline-block',
}

const MENU_ITEM_STYLE: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  fontFamily: "'Jost', sans-serif",
  fontSize: '11px',
  fontWeight: 400,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary-c, #C8C4BC)',
  textDecoration: 'none',
}

export function RecurringPaymentRow({ payment }: { payment: RecurringPayment }) {
  const [isPending, startTransition] = useTransition()
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)

  const status = getPaymentStatus(payment)
  const statusConfig = STATUS_CONFIG[status]

  function handleMenuToggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (!showMenu && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      })
    }
    setShowMenu(prev => !prev)
  }

  useEffect(() => {
    if (!showMenu) return
    const close = () => setShowMenu(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [showMenu])

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
          <span style={{ ...BADGE_STYLE, background: 'rgba(201,168,76,0.08)', color: 'var(--text-muted-c, #9A9690)', border: '1px solid rgba(201,168,76,0.15)' }}>
            {payment.category}
          </span>
          {payment.auto_log_transaction && (
            <span style={{ ...BADGE_STYLE, background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
              Auto-log
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 font-sans text-[11px] font-light text-dynasty-gray-500">
          <span>{(payment.properties as { name: string } | null)?.name ?? '—'}</span>
          <span className="text-[rgba(201,168,76,0.4)]">·</span>
          <span>{frequencyLabels[payment.frequency] ?? payment.frequency}</span>
          <span className="text-[rgba(201,168,76,0.4)]">·</span>
          <span>Due {formatDate(payment.next_due_date)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <p className="font-mono text-[14px] font-medium tracking-tight text-dynasty-gold">
            {formatCurrency(payment.amount)}
          </p>
          <div className="mt-1">
            <span style={{ ...BADGE_STYLE, background: statusConfig.bg, color: statusConfig.color, border: statusConfig.border }}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mark as Paid button — only show when pending/overdue */}
          {status !== 'paid' && (
            <button
              onClick={handleMarkPaid}
              disabled={isPending || !payment.is_active}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(201,168,76,0.10)',
                border: '1px solid rgba(201,168,76,0.30)',
                color: '#C9A84C',
                fontFamily: "'Jost', sans-serif",
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '6px 12px',
                borderRadius: '1px',
                cursor: isPending || !payment.is_active ? 'not-allowed' : 'pointer',
                opacity: isPending || !payment.is_active ? 0.5 : 1,
              }}
            >
              <CheckCircle2 size={12} strokeWidth={1.5} /> Paid
            </button>
          )}

          {/* Three-dots menu */}
          <div style={{ position: 'relative' }}>
            <button
              ref={triggerRef}
              onClick={handleMenuToggle}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px',
                background: 'transparent',
                border: '1px solid transparent',
                borderRadius: '1px',
                cursor: 'pointer',
                color: 'var(--text-muted-c, #9A9690)',
                transition: 'border-color 0.2s, color 0.2s',
              }}
            >
              <MoreHorizontal size={16} strokeWidth={1.2} />
            </button>

            {showMenu && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'fixed',
                  top: menuPos.top,
                  right: menuPos.right,
                  zIndex: 9999,
                  background: 'var(--card-bg, #1A1812)',
                  border: '1px solid var(--card-border-color, rgba(201,168,76,0.15))',
                  borderRadius: '2px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  minWidth: '160px',
                  overflow: 'hidden',
                }}
              >
                <button onClick={handleMarkPaid} disabled={isPending} style={MENU_ITEM_STYLE}>
                  <CheckCircle2 size={13} strokeWidth={1.2} /> Mark as Paid
                </button>
                <Link
                  href={`/recurring/${payment.id}/edit`}
                  style={MENU_ITEM_STYLE}
                  onClick={() => setShowMenu(false)}
                >
                  <Edit size={13} strokeWidth={1.2} /> Edit
                </Link>
                <button onClick={handleToggleActive} disabled={isPending} style={MENU_ITEM_STYLE}>
                  <Power size={13} strokeWidth={1.2} />
                  {payment.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <div style={{ height: '1px', background: 'var(--divider-c, rgba(255,255,255,0.06))', margin: '2px 0' }} />
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  style={{ ...MENU_ITEM_STYLE, color: '#B76E79' }}
                >
                  <Trash2 size={13} strokeWidth={1.2} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
