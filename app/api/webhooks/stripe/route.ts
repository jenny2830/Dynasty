import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
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
      const plan = session.metadata?.plan
      const subscriptionId = session.subscription as string

      if (landlordId && plan) {
        await supabase
          .from('landlords')
          .update({
            plan: plan as 'free' | 'starter' | 'landlord' | 'portfolio',
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

      await supabase
        .from('landlords')
        .update({ stripe_subscription_id: subscription.id })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase
        .from('landlords')
        .update({ plan: 'starter', stripe_subscription_id: null })
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
