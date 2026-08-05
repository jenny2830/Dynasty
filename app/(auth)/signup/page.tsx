import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SignupCapture } from './SignupCapture'
import { SignupForm } from './SignupForm'

export const metadata = { title: 'Create account' }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; email?: string }>
}) {
  const { error, success, email: emailParam } = await searchParams

  async function signup(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const admin = createAdminClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      redirect(`/signup?error=${encodeURIComponent(authError.message)}`)
    }

    if (authData.user) {
      const { error: profileError } = await admin
        .from('landlords')
        .insert({
          auth_user_id: authData.user.id,
          full_name: fullName,
          email,
        })

      if (profileError) {
        redirect(`/signup?error=${encodeURIComponent('Failed to create profile. Please try again.')}`)
      }
    }

    redirect(`/signup?success=1&email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="auth-gate" style={{
      minHeight: '100vh',
      backgroundColor: '#080808',
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #1C1A17 0%, #080808 70%), linear-gradient(135deg, rgba(201,168,76,0.06) 0%, transparent 40%), linear-gradient(225deg, rgba(201,168,76,0.04) 0%, transparent 40%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      position: 'relative',
    }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, #C9A84C 50%, transparent 100%)' }} aria-hidden />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dynasty_logo.png" alt="Dynasty" style={{ width: '280px', height: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
          <p style={{ marginTop: '12px', textAlign: 'center', fontFamily: "'Jost', sans-serif", fontSize: '8px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.35em', color: 'rgba(201,168,76,0.4)' }}>
            <span style={{ display: 'inline-block', marginRight: '8px' }}>◆</span>
            Legacy &middot; Luxury &middot; Timeless
            <span style={{ display: 'inline-block', marginLeft: '8px' }}>◆</span>
          </p>
        </div>

        <div style={{ background: 'rgba(17,17,17,0.97)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '2px', padding: '48px 44px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', maxWidth: '420px', width: '100%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '18px', height: '18px', borderTop: '1px solid rgba(201,168,76,0.35)', borderLeft: '1px solid rgba(201,168,76,0.35)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '18px', height: '18px', borderTop: '1px solid rgba(201,168,76,0.35)', borderRight: '1px solid rgba(201,168,76,0.35)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '18px', height: '18px', borderBottom: '1px solid rgba(201,168,76,0.35)', borderLeft: '1px solid rgba(201,168,76,0.35)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '18px', height: '18px', borderBottom: '1px solid rgba(201,168,76,0.35)', borderRight: '1px solid rgba(201,168,76,0.35)' }} />

          {success ? (
            <div style={{ textAlign: 'center' }}>
              {emailParam && <SignupCapture email={decodeURIComponent(emailParam)} />}
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 500, letterSpacing: '0.04em', color: '#FAF7F2', margin: 0 }}>
                Check Your Email
              </h1>
              <p style={{ marginTop: '6px', fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#6B6B65' }}>
                Confirmation pending
              </p>
              <div style={{ margin: '16px auto 0', height: '1px', width: '40px', background: 'rgba(201,168,76,0.5)' }} />
              <p style={{ marginTop: '28px', fontFamily: "'Jost', sans-serif", fontSize: '13px', fontWeight: 300, lineHeight: 1.6, color: '#8A8A82' }}>
                We&apos;ve sent a confirmation link to your email address. Click the link to activate your account and begin.
              </p>
              <a
                href="/login"
                style={{ display: 'block', marginTop: '32px', width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', fontFamily: "'Jost', sans-serif", fontWeight: 400, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center', textDecoration: 'none', borderRadius: '1px' }}
              >
                Back to Sign In
              </a>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 500, letterSpacing: '0.04em', color: '#FAF7F2', margin: 0 }}>
                  Begin Your Dynasty
                </h1>
                <p style={{ marginTop: '6px', fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#6B6B65' }}>
                  Create your landlord account
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
                <span style={{ color: '#C9A84C', fontSize: '9px' }}>◆</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
              </div>

              <SignupForm action={signup} error={error} />
            </>
          )}
        </div>

        {!success && (
          <p style={{ marginTop: '28px', textAlign: 'center', fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 300, letterSpacing: '0.08em', color: '#6B6B65' }}>
            Already a member?{' '}
            <Link href="/login" style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#C9A84C', textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
