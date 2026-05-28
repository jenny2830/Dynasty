import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const metadata = { title: 'Sign in' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  async function login(formData: FormData) {
    'use server'
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      const params = new URLSearchParams()
      params.set('error', authError.message)
      if (next) params.set('next', next)
      redirect(`/login?${params.toString()}`)
    }

    redirect(next ?? '/')
  }

  return (
    <div className="deco-marble relative flex min-h-screen flex-col items-center justify-center bg-dynasty-black px-4 py-12">
      {/* Gold top accent line */}
      <div
        className="fixed top-0 left-0 right-0 h-px"
        style={{ background: 'var(--accent-top)' }}
        aria-hidden
      />

      <div className="w-full max-w-[420px]">
        {/* Logo + tagline outside card */}
        <div className="mb-6 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dynasty_logo.jpg"
            alt="Dynasty"
            style={{ height: '72px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
          <p className="mt-3 text-center font-sans text-[8px] font-light uppercase tracking-[0.35em] text-[rgba(201,168,76,0.4)]">
            <span className="inline-block mr-2">◆</span>
            Legacy &middot; Luxury &middot; Timeless
            <span className="inline-block ml-2">◆</span>
          </p>
        </div>

        {/* Auth card — deco corner frame */}
        <div
          className="deco-frame relative mx-auto rounded-[2px] border border-[rgba(201,168,76,0.18)] bg-[rgba(17,17,17,0.96)] px-11 py-12 backdrop-blur-[20px]"
          style={{ boxShadow: 'var(--shadow-modal)' }}
        >
          <div className="text-center">
            <h1 className="font-serif text-[26px] font-medium tracking-[0.04em] text-dynasty-warm-white">
              Welcome Back
            </h1>
            <p className="mt-1.5 font-sans text-[11px] font-light uppercase tracking-[0.18em] text-dynasty-gray-500">
              Access your portfolio
            </p>
            <div className="mx-auto mt-4 h-px w-10 bg-dynasty-gold/50" />
          </div>

          {error && (
            <div className="mt-7 rounded-[1px] border border-[rgba(183,110,121,0.3)] bg-[rgba(183,110,121,0.08)] px-4 py-3">
              <p className="font-sans text-[12px] font-light text-dynasty-rose-light">
                {decodeURIComponent(error)}
              </p>
            </div>
          )}

          <form action={login} className="mt-8 space-y-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="font-sans text-[10px] font-light uppercase tracking-[0.15em] text-dynasty-gold/70 transition-colors hover:text-dynasty-gold-light"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="mt-3 w-full">
              Sign In
            </Button>
          </form>
        </div>

        <p className="mt-7 text-center font-sans text-[11px] font-light tracking-[0.08em] text-dynasty-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium uppercase tracking-[0.18em] text-dynasty-gold transition-colors hover:text-dynasty-gold-light"
          >
            Create One
          </Link>
        </p>
      </div>
    </div>
  )
}
