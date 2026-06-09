'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Bell, CheckCircle2, MoreHorizontal, Power, Trash2, Edit, Clock, AlertTriangle, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { isRecurringPaymentPaidThisMonth, isRecurringPaymentPending } from '@/lib/recurring-utils'
import { markAsPaid, markAsUnpaid, toggleRecurringActive, deleteRecurringPayment } from '@/app/actions/recurring'

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
  reminder_days_before?: number | null
  properties: { name: string } | null
}

const frequencyLabels: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annual',
}

type ReminderStatus = 'paid' | 'overdue' | 'due-today' | 'upcoming' | 'scheduled'

function getReminderStatus(payment: RecurringPayment): ReminderStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(payment.next_due_date)
  due.setHours(0, 0, 0, 0)

  if (isRecurringPaymentPaidThisMonth(payment.last_paid_date)) {
    return 'paid'
  }

  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const reminderDays = payment.reminder_days_before ?? 5

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'due-today'
  if (diffDays <= reminderDays) return 'upcoming'
  return 'scheduled'
}

const STATUS_CONFIG: Record<ReminderStatus, {
  label: string
  bg: string
  color: string
  border: string
  icon: React.ElementType
}> = {
  paid: {
    label: 'Paid',
    bg: 'rgba(34,197,94,0.08)',
    color: '#16a34a',
    border: '1px solid rgba(34,197,94,0.25)',
    icon: CheckCircle2,
  },
  overdue: {
    label: 'Overdue',
    bg: 'rgba(183,110,121,0.12)',
    color: '#B76E79',
    border: '1px solid rgba(183,110,121,0.35)',
    icon: AlertTriangle,
  },
  'due-today': {
    label: 'Due Today',
    bg: 'rgba(251,146,60,0.10)',
    color: '#ea580c',
    border: '1px solid rgba(251,146,60,0.35)',
    icon: Bell,
  },
  upcoming: {
    label: 'Reminder',
    bg: 'rgba(201,168,76,0.10)',
    color: '#C9A84C',
    border: '1px solid rgba(201,168,76,0.30)',
    icon: Bell,
  },
  scheduled: {
    label: 'Scheduled',
    bg: 'rgba(201,168,76,0.06)',
    color: 'var(--text-muted-c, #8A8A82)',
    border: '1px solid rgba(201,168,76,0.15)',
    icon: Clock,
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
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
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
  color: 'var(--text-secondary-c)',
  textDecoration: 'none',
}

export function RecurringPaymentRow({ payment }: { payment: RecurringPayment }) {
  const [isPending, startTransition] = useTransition()
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)

  const status = getReminderStatus(payment)
  const statusConfig = STATUS_CONFIG[status]
  const StatusIcon = statusConfig.icon
  const isPaid = status === 'paid'
  const needsAttention = status === 'overdue' || status === 'due-today' || status === 'upcoming'

  function handleMenuToggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (!showMenu && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      // position: fixed coordinates are viewport-relative — do NOT add scrollY
      setMenuPos({
        top: rect.bottom + 4,
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

  function handleMarkUnpaid() {
    startTransition(async () => {
      await markAsUnpaid(payment.id)
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
    if (!confirm('Delete this recurring payment? This cannot be undone.')) return
    startTransition(async () => {
      await deleteRecurringPayment(payment.id)
    })
  }

  return (
    <div
      className="flex items-center gap-4 px-7 py-4 transition-colors"
      style={{
        background: needsAttention ? 'var(--table-row-hover-bg)' : 'transparent',
        borderLeft: needsAttention ? '2px solid var(--accent-c)' : '2px solid transparent',
        opacity: needsAttention ? 1 : undefined,
      }}
    >
      {/* Bell icon for reminder emphasis */}
      <div style={{
        flexShrink: 0,
        width: '32px',
        height: '32px',
        borderRadius: '1px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: statusConfig.bg,
        border: statusConfig.border,
        color: statusConfig.color,
        opacity: isPaid ? 0.6 : 1,
      }}>
        <StatusIcon size={14} strokeWidth={1.4} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="font-sans text-[13px]"
            style={{ color: 'var(--text-primary-c)', opacity: isPaid ? 0.7 : 1 }}
          >
            {payment.name}
          </span>
          <span style={{
            ...BADGE_STYLE,
            background: 'var(--badge-pos-bg)',
            color: 'var(--text-muted-c)',
            border: '1px solid var(--badge-pos-border)',
          }}>
            {payment.category}
          </span>
          {payment.auto_log_transaction && (
            <span style={{
              ...BADGE_STYLE,
              background: 'var(--badge-pos-bg)',
              color: 'var(--badge-pos-text)',
              border: '1px solid var(--badge-pos-border)',
            }}>
              Auto-log
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 font-sans text-[11px] font-light" style={{ color: 'var(--text-muted-c)' }}>
          <span>{(payment.properties as { name: string } | null)?.name ?? '—'}</span>
          <span style={{ color: 'var(--divider-c)' }}>·</span>
          <span>{frequencyLabels[payment.frequency] ?? payment.frequency}</span>
          <span style={{ color: 'var(--divider-c)' }}>·</span>
          <span style={{ color: needsAttention ? statusConfig.color : 'var(--text-muted-c)' }}>
            {isPaid ? `Paid — next due ${formatDate(payment.next_due_date)}` : `Due ${formatDate(payment.next_due_date)}`}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <p className="font-mono text-[14px] font-medium tracking-tight" style={{ color: 'var(--accent-c)' }}>
            {formatCurrency(payment.amount)}
          </p>
          <div className="mt-1">
            <span style={{ ...BADGE_STYLE, background: statusConfig.bg, color: statusConfig.color, border: statusConfig.border }}>
              <StatusIcon size={9} strokeWidth={1.8} />
              {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mark as Paid — shown when not yet paid */}
          {!isPaid && (
            <button
              onClick={handleMarkPaid}
              disabled={isPending || !payment.is_active}
              title="Mark as paid"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: needsAttention ? 'var(--badge-pos-bg)' : 'transparent',
                border: `1px solid var(--badge-pos-border)`,
                color: 'var(--badge-pos-text)',
                fontFamily: "'Jost', sans-serif",
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '6px 12px',
                borderRadius: '1px',
                cursor: isPending || !payment.is_active ? 'not-allowed' : 'pointer',
                opacity: isPending || !payment.is_active ? 0.5 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              <CheckCircle2 size={12} strokeWidth={1.5} />
              {isPending ? '…' : 'Mark Paid'}
            </button>
          )}

          {/* Three-dots menu */}
          <div style={{ position: 'relative' }}>
            <button
              ref={triggerRef}
              onClick={handleMenuToggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: 'transparent',
                border: '1px solid transparent',
                borderRadius: '1px',
                cursor: 'pointer',
                color: 'var(--text-muted-c)',
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
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border-color)',
                  borderRadius: '2px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                  minWidth: '160px',
                  overflow: 'hidden',
                }}
              >
                {!isPaid ? (
                  <button onClick={handleMarkPaid} disabled={isPending} style={MENU_ITEM_STYLE}>
                    <CheckCircle2 size={13} strokeWidth={1.2} /> Mark as Paid
                  </button>
                ) : (
                  <button onClick={handleMarkUnpaid} disabled={isPending} style={MENU_ITEM_STYLE}>
                    <RotateCcw size={13} strokeWidth={1.2} /> Mark as Unpaid
                  </button>
                )}
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
                <div style={{ height: '1px', background: 'var(--divider-c)', margin: '2px 0' }} />
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
