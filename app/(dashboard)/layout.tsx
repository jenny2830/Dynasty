import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { PreferencesInit } from '@/components/dashboard/PreferencesInit'
import { DashboardClientWrapper } from '@/components/dashboard/DashboardClientWrapper'
import { DashboardThemeShell } from '@/components/dashboard/DashboardThemeShell'
import { toThemeId, THEMES } from '@/lib/themes'
import type { PlanId } from '@/lib/plans'
import { FREE_TRIAL_MAX_SESSIONS } from '@/lib/plans'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: landlord } = await supabase
    .from('landlords')
    .select('id, theme_preference, plan, sessions_used, free_trial_expired, is_blocked')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  // Blocked accounts cannot access the dashboard
  if (landlord?.is_blocked) {
    redirect('/login?error=Your+account+has+been+suspended.+Contact+support.')
  }

  const plan = (landlord?.plan ?? 'free') as PlanId
  const sessionsUsed = landlord?.sessions_used ?? 0
  const trialExpired = landlord?.free_trial_expired ?? false

  const initialThemeId = toThemeId(landlord?.theme_preference)

  // Build a { themeId: pageBg } map so the pre-paint script can resolve the
  // correct background instantly (prefers the locally-saved theme, falls back
  // to the server value). This prevents a dark/black flash on refresh when a
  // light theme is active.
  const pageBgMap = Object.fromEntries(
    (Object.keys(THEMES) as (keyof typeof THEMES)[]).map((id) => [id, THEMES[id].pageBg])
  )
  const themeBootstrap = `(() => {try {
    var map = ${JSON.stringify(pageBgMap)};
    var saved = localStorage.getItem('dynasty-theme');
    var id = (saved && map[saved]) ? saved : ${JSON.stringify(initialThemeId)};
    var bg = map[id];
    if (bg) {
      document.documentElement.style.backgroundColor = bg;
      document.documentElement.style.colorScheme = id.indexOf('light') === 0 ? 'light' : 'dark';
      if (document.body) document.body.style.backgroundColor = bg;
    }
  } catch (e) {} })();`

  return (
    <DashboardThemeShell
      initialThemeId={initialThemeId}
      sidebar={
        <>
          <PreferencesInit />
          <Sidebar userId={user.id} />
        </>
      }
    >
      <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <DashboardClientWrapper
          landlordId={landlord?.id ?? ''}
          plan={plan}
          sessionsUsed={sessionsUsed}
          trialExpired={trialExpired}
        >
          {children}
        </DashboardClientWrapper>
      </div>

      {/* Full-screen upgrade wall — rendered server-side so there's no flash */}
      {plan === 'free' && trialExpired && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border-color)',
            borderRadius: '2px',
            padding: '56px 48px',
            textAlign: 'center',
            maxWidth: '480px',
            width: '100%',
            position: 'relative',
          }}>
            {/* Corner marks */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', width: '18px', height: '18px', borderTop: '1px solid var(--corner-color)', borderLeft: '1px solid var(--corner-color)' }} />
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '18px', height: '18px', borderBottom: '1px solid var(--corner-color)', borderRight: '1px solid var(--corner-color)' }} />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/dynastynobg.png"
              alt="Dynasty"
              style={{ height: '80px', objectFit: 'contain', margin: '0 auto 20px', display: 'block' }}
            />
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '28px',
              fontWeight: 600,
              color: 'var(--text-primary-c)',
              marginBottom: '10px',
              letterSpacing: '0.02em',
            }}>
              Your free trial has ended
            </h2>
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '15px',
              fontWeight: 400,
              color: 'var(--text-muted-c)',
              marginBottom: '32px',
              letterSpacing: '0.04em',
              lineHeight: 1.6,
            }}>
              You used all {FREE_TRIAL_MAX_SESSIONS} free sessions. Choose a plan to continue building your property empire.
            </p>
            <Link
              href="/upgrade"
              style={{
                display: 'inline-block',
                background: 'var(--gradient-value)',
                color: 'var(--text-on-accent)',
                fontFamily: "'Jost', sans-serif",
                fontWeight: 600,
                fontSize: '15px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '14px 48px',
                borderRadius: '1px',
                textDecoration: 'none',
                boxShadow: `0 4px 20px var(--accent-c, rgba(201,168,76,0.25))`,
              }}
            >
              Choose Your Plan
            </Link>
          </div>
        </div>
      )}
    </DashboardThemeShell>
  )
}
