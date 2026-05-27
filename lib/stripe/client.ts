import Stripe from 'stripe'

/**
 * Server-side Stripe client factory.
 * Call this lazily (inside a request handler) — never at module level.
 * Never import in client components.
 */
export function getStripeClient(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
  })
}
