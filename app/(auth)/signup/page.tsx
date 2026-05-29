import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SignupCapture } from './SignupCapture'

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
    <div className="deco-marble relative flex min-h-screen flex-col items-center justify-center bg-dynasty-black px-4 py-12">
      <div
        className="fixed top-0 left-0 right-0 h-px"
        style={{ background: 'var(--accent-top)' }}
        aria-hidden
      />

      <div className="w-full max-w-[420px]">
        {/* Logo + tagline outside card */}
        <div className="deco-sunburst mb-6 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dynastynobg.png"
            alt="Dynasty"
            style={{ width: '280px', height: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
          <p className="mt-3 text-center font-sans text-[8px] font-light uppercase tracking-[0.35em] text-[rgba(201,168,76,0.4)]">
            <span className="inline-block mr-2">◆</span>
            Legacy &middot; Luxury &middot; Timeless
            <span className="inline-block ml-2">◆</span>
          </p>
        </div>

        {/* Auth card — lux-card with four-corner Art Deco frame */}
        <div
          className="lux-card deco-corners-4 relative mx-auto px-11 py-12"
          style={{ boxShadow: 'var(--shadow-modal)' }}
        >
          {success ? (
            <div className="text-center">
              {emailParam && <SignupCapture email={decodeURIComponent(emailParam)} />}
              <h1 className="font-serif text-[26px] font-medium tracking-[0.04em] text-dynasty-warm-white">
                Check Your Email
              </h1>
              <p className="mt-1.5 font-sans text-[11px] font-light uppercase tracking-[0.18em] text-dynasty-gray-500">
                Confirmation pending
              </p>
              <div className="mx-auto mt-4 h-px w-10 bg-dynasty-gold/50" />
              <p className="mt-7 font-sans text-[13px] font-light leading-relaxed text-dynasty-gray-300">
                We&apos;ve sent a confirmation link to your email address. Click
                the link to activate your account and begin.
              </p>
              <Button asChild variant="outline" className="mt-8 w-full">
                <Link href="/login">Back to Sign In</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="font-serif text-[26px] font-medium tracking-[0.04em] text-dynasty-warm-white">
                  Begin Your Dynasty
                </h1>
                <p className="mt-1.5 font-sans text-[11px] font-light uppercase tracking-[0.18em] text-dynasty-gray-500">
                  Create your landlord account
                </p>
              </div>

              {/* Ornamental divider */}
              <div className="deco-divider">
                <span className="deco-divider-mark">◆</span>
              </div>

              {error && (
                <div className="mt-7 rounded-[1px] border border-[rgba(183,110,121,0.3)] bg-[rgba(183,110,121,0.08)] px-4 py-3">
                  <p className="font-sans text-[12px] font-light text-dynasty-rose-light">
                    {decodeURIComponent(error)}
                  </p>
                </div>
              )}

              <form action={signup} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                <Button type="submit" className="mt-3 w-full">
                  Create Account
                </Button>
              </form>

              <p className="mt-6 text-center font-sans text-[10px] font-light leading-relaxed tracking-[0.04em] text-dynasty-gray-500">
                By signing up you agree to our{' '}
                <Link href="/terms" className="text-dynasty-gold/80 hover:text-dynasty-gold hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-dynasty-gold/80 hover:text-dynasty-gold hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </>
          )}
        </div>

        {!success && (
          <p className="mt-7 text-center font-sans text-[11px] font-light tracking-[0.08em] text-dynasty-gray-400">
            Already a member?{' '}
            <Link
              href="/login"
              className="font-medium uppercase tracking-[0.18em] text-dynasty-gold transition-colors hover:text-dynasty-gold-light"
            >
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
