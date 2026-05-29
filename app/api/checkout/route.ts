import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_MAP: Record<string, string> = {
  starter:   process.env.STRIPE_PRICE_STARTER!,
  landlord:  process.env.STRIPE_PRICE_LANDLORD!,
  portfolio: process.env.STRIPE_PRICE_PORTFOLIO!,
}

export async function POST(request: Request) {
  try {
    const { plan } = await request.json()

    if (!PRICE_MAP[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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
      line_items: [{ price: PRICE_MAP[plan], quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?success=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?canceled=true`,
      metadata: { landlord_id: landlord.id, plan },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
