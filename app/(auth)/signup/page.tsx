import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const metadata = { title: 'Create account' }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const { error, success } = await searchParams

  async function signup(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const admin = createAdminClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      redirect(`/signup?error=${encodeURIComponent(authError.message)}`)
    }

    if (authData.user) {
      // Create landlord profile using admin client to bypass RLS on insert
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

    redirect('/signup?success=1')
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
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dynasty-gold/10 border border-dynasty-gold/30 mx-auto">
                <Crown className="h-6 w-6 text-dynasty-gold" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-xl font-semibold text-dynasty-cream">
                Check your email
              </h2>
              <p className="text-sm text-dynasty-gray-400">
                We sent a confirmation link to your email address. Click it to activate your account.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-xl font-semibold text-dynasty-cream mb-1">
                Start your dynasty
              </h2>
              <p className="text-sm text-dynasty-gray-400 mb-6">
                Create your landlord account — free to start
              </p>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-400">{decodeURIComponent(error)}</p>
                </div>
              )}

              <form action={signup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    required
                  />
                </div>

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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                <Button type="submit" className="w-full mt-2">
                  Create account
                </Button>
              </form>

              <p className="mt-5 text-center text-xs text-dynasty-gray-400">
                By signing up you agree to our{' '}
                <Link href="/terms" className="text-dynasty-gold hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-dynasty-gold hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </>
          )}
        </div>

        {!success && (
          <p className="text-center text-sm text-dynasty-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-dynasty-gold hover:text-dynasty-gold-light transition-colors"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
