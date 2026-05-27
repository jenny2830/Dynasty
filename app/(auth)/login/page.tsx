import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Crown } from 'lucide-react'
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-dynasty-black px-4">
      {/* Gold top accent line */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-dynasty-gold to-transparent" />

      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dynasty-gold/30 bg-dynasty-gray-900">
            <Crown className="h-7 w-7 text-dynasty-gold" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold tracking-widest text-dynasty-gold">
              DYNASTY
            </h1>
            <p className="mt-1 text-xs tracking-widest text-dynasty-gray-400 uppercase">
              Property Wealth Management
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-dynasty-gray-700 bg-dynasty-gray-900 p-8 shadow-2xl">
          <h2 className="font-serif text-xl font-semibold text-dynasty-cream mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-dynasty-gray-400 mb-6">
            Sign in to your portfolio
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{decodeURIComponent(error)}</p>
            </div>
          )}

          <form action={login} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-dynasty-gold hover:text-dynasty-gold-light transition-colors"
                >
                  Forgot password?
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

            <Button type="submit" className="w-full mt-2">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-dynasty-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-dynasty-gold hover:text-dynasty-gold-light transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
