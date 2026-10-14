// ─────────────────────────────────────────────────────────────────────────────
//  Dynasty Membership — single all-access plan, two billing intervals.
//  Price IDs are read from env vars only; never hardcoded or accepted from clients.
// ─────────────────────────────────────────────────────────────────────────────

export const MEMBERSHIP = {
  name: 'Dynasty Membership',
  description:
    'Full access to every feature — unlimited properties, all reports, AI scanner, and more.',
  monthly: {
    priceDisplay: 'CAD $16.90',
    priceValue: 16.9,
    interval: 'month' as const,
    intervalLabel: '/month',
    get stripePriceId() {
      return process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY
    },
  },
  yearly: {
    priceDisplay: 'CAD $149',
    priceValue: 149,
    interval: 'year' as const,
    intervalLabel: '/year',
    monthlyEquivalent: '≈ CAD $12.42/month',
    savingsLabel: 'Save 26%',
    get stripePriceId() {
      return process.env.STRIPE_PRICE_MEMBERSHIP_YEARLY
    },
  },
} as const

/** Everything that comes with the Dynasty Membership. */
export const MEMBERSHIP_FEATURES = [
  'Unlimited properties',
  'Unlimited transactions & expense tracking',
  'Recurring payments tracker',
  'AI receipt scanner',
  'Financial reports',
  'ROI calculator',
  'PDF & CSV export',
  'Four-theme design system',
  'Priority support',
] as const

// ── Free Trial ────────────────────────────────────────────────────────────────

export const FREE_TRIAL_MAX_SESSIONS = 3

export function getSessionsRemaining(sessionsUsed: number): number {
  return Math.max(0, FREE_TRIAL_MAX_SESSIONS - sessionsUsed)
}

// ── Legacy plan type ──────────────────────────────────────────────────────────
// Kept for DB column compatibility. The `landlords.plan` column stores these
// values. New members receive `plan = 'landlord'` (full-access, DB-safe value)
// until a future migration widens the enum.
export type PlanId = 'free' | 'starter' | 'landlord' | 'portfolio'

// ── Single access check ───────────────────────────────────────────────────────
/**
 * Returns true when the landlord has an active Dynasty Membership.
 * Works for both new subscribers and legacy tier subscribers.
 *
 * Logic (in priority order):
 *  1. Any live `stripe_subscription_id` → member (covers all new & legacy prices)
 *  2. `plan` column set to a paid tier → member (manual / legacy back-fill)
 */
export function hasActiveMembership(landlord: {
  stripe_subscription_id?: string | null
  plan?: string | null
}): boolean {
  if (landlord.stripe_subscription_id) return true
  if (landlord.plan && landlord.plan !== 'free') return true
  return false
}
