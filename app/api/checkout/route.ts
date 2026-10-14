import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { billing } = body as { billing?: string }

    // Only 'monthly' or 'yearly' accepted — raw price IDs are never accepted from the client
    if (billing !== 'monthly' && billing !== 'yearly') {
      return NextResponse.json({ error: 'Invalid billing interval' }, { status: 400 })
    }

    const priceId =
      billing === 'monthly'
        ? process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY
        : process.env.STRIPE_PRICE_MEMBERSHIP_YEARLY

    if (!priceId) {
      console.error(`Checkout: price ID not configured for billing=${billing}`)
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: landlord } = await supabase
      .from('landlords')
      .select('id, email, stripe_customer_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    let customerId = landlord.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: landlord.email,
        metadata: { landlord_id: landlord.id, supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from('landlords')
        .update({ stripe_customer_id: customerId })
        .eq('id', landlord.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?canceled=true`,
      // billing interval stored in metadata; never the raw price ID
      metadata: { landlord_id: landlord.id, billing },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
