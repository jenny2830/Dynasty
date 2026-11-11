import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/server'
import { getStripeClient } from '@/lib/stripe/client'

export async function POST() {
  try {
    const stripe = getStripeClient()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: landlord } = await supabase
      .from('landlords')
      .select('stripe_customer_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!landlord?.stripe_customer_id) {
      return NextResponse.json({ error: 'No billing account' }, { status: 404 })
    }

    const locale = await getLocale()
    const session = await stripe.billingPortal.sessions.create({
      customer: landlord.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      locale: locale === 'es' ? 'es' : 'en',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Portal failed' }, { status: 500 })
  }
}
