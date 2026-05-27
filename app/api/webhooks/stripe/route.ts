import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const priceId = subscription.items.data[0]?.price.id

      let plan: 'starter' | 'landlord' | 'portfolio' = 'starter'
      if (priceId === process.env.STRIPE_PRICE_LANDLORD) plan = 'landlord'
      else if (priceId === process.env.STRIPE_PRICE_PORTFOLIO) plan = 'portfolio'

      await admin
        .from('landlords')
        .update({
          stripe_subscription_id: subscription.id,
          plan,
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await admin
        .from('landlords')
        .update({
          stripe_subscription_id: null,
          plan: 'starter',
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
