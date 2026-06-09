type RecurringPaymentLike = {
  next_due_date: string
  last_paid_date?: string | null
  is_active?: boolean
}

/** True when the payment still needs attention for its current due date. */
export function isRecurringPaymentPending(
  payment: RecurringPaymentLike,
  withinDays = 7,
): boolean {
  if (payment.is_active === false) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() + withinDays)

  const due = new Date(payment.next_due_date)
  due.setHours(0, 0, 0, 0)
  if (due > cutoff) return false

  if (!payment.last_paid_date) return true

  const lastPaid = new Date(payment.last_paid_date)
  return !(
    lastPaid.getMonth() === due.getMonth() &&
    lastPaid.getFullYear() === due.getFullYear()
  )
}

/** True when the payment was marked paid for the current calendar month. */
export function isRecurringPaymentPaidThisMonth(
  lastPaidDate: string | null | undefined,
): boolean {
  if (!lastPaidDate) return false

  const lastPaid = new Date(lastPaidDate)
  lastPaid.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    lastPaid.getMonth() === today.getMonth() &&
    lastPaid.getFullYear() === today.getFullYear()
  )
}
