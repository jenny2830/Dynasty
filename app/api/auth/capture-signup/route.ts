import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

const MAX_SIGNUPS_PER_IP = 3
const MAX_SIGNUPS_PER_FINGERPRINT = 2

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'throwaway.email', 'guerrillamail.com',
  'mailinator.com', 'yopmail.com', 'sharklasers.com',
  'guerrillamailblock.com', 'grr.la', 'dispostable.com',
  'trashmail.com', '10minutemail.com', 'temp-mail.org',
  'fakeinbox.com', 'spamgourmet.com', 'maildrop.cc',
])

export async function POST(request: Request) {
  try {
    const { email, fingerprint } = await request.json()
    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown'

    const supabase = createAdminClient()

    // Block disposable email domains
    const emailDomain = (email as string).split('@')[1]?.toLowerCase()
    if (emailDomain && DISPOSABLE_DOMAINS.has(emailDomain)) {
      return NextResponse.json(
        { error: 'Please use a permanent email address.' },
        { status: 400 },
      )
    }

    // Block IP abuse
    if (ip !== 'unknown') {
      const { count: ipCount } = await supabase
        .from('signup_audit')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)

      if ((ipCount ?? 0) >= MAX_SIGNUPS_PER_IP) {
        return NextResponse.json(
          { error: 'Too many accounts from this network. Contact support.' },
          { status: 429 },
        )
      }
    }

    // Block fingerprint abuse
    if (fingerprint) {
      const { count: fpCount } = await supabase
        .from('signup_audit')
        .select('*', { count: 'exact', head: true })
        .eq('fingerprint', fingerprint)

      if ((fpCount ?? 0) >= MAX_SIGNUPS_PER_FINGERPRINT) {
        return NextResponse.json(
          { error: 'Account limit reached on this device. Contact support.' },
          { status: 429 },
        )
      }
    }

    // Log the signup
    await supabase.from('signup_audit').insert({
      email,
      ip_address: ip,
      fingerprint: fingerprint ?? null,
      user_agent: headersList.get('user-agent'),
    })

    // Stamp landlord with IP + fingerprint
    await supabase
      .from('landlords')
      .update({ signup_ip: ip, signup_fingerprint: fingerprint ?? null })
      .eq('email', email)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('capture-signup error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
