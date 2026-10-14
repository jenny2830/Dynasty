import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Legacy price IDs — subscriptions on these prices are still valid memberships.
// We never gate access by which price was used; any active subscription = full access.
const LEGACY_PRICE_IDS = new Set(
  [
    process.env.STRIPE_PRICE_STARTER,
    process.env.STRIPE_PRICE_LANDLORD,
    process.env.STRIPE_PRICE_PORTFOLIO,
  ].filter(Boolean),
)
void LEGACY_PRICE_IDS // referenced only for documentation; not used in logic below

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const landlordId = session.metadata?.landlord_id
      const subscriptionId = session.subscription as string

      if (landlordId) {
        // Set plan = 'landlord' (DB-compatible full-access value)
        // and store subscription + customer IDs so hasActiveMembership() works.
        await supabase
          .from('landlords')
          .update({
            plan: 'landlord',
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
          })
          .eq('id', landlordId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const isActive =
        subscription.status === 'active' || subscription.status === 'trialing'

      if (isActive) {
        // Keep subscription reference up-to-date
        await supabase
          .from('landlords')
          .update({ stripe_subscription_id: subscription.id })
          .eq('stripe_customer_id', customerId)
      } else {
        // Past-due / canceled / unpaid / paused → revoke membership
        await supabase
          .from('landlords')
          .update({ plan: 'free', stripe_subscription_id: null })
          .eq('stripe_customer_id', customerId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase
        .from('landlords')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      console.error(`Payment failed for customer: ${customerId}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}
