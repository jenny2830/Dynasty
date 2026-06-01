'use client'

import { useRouter } from 'next/navigation'
import { getSessionsRemaining, FREE_TRIAL_MAX_SESSIONS } from '@/lib/plans'
import { useAppTheme } from '@/lib/theme-context'

interface TrialBannerProps {
  plan: string
  sessionsUsed: number
  trialExpired: boolean
}

export function TrialBanner({ plan, sessionsUsed, trialExpired }: TrialBannerProps) {
  const router = useRouter()
  const { theme } = useAppTheme()
  if (plan !== 'free') return null

  const remaining = getSessionsRemaining(sessionsUsed)

  if (trialExpired) {
    return (
      <div style={{
        background: `linear-gradient(135deg, ${theme.valueNegative}26, ${theme.valueNegative}0D)`,
        border: `1px solid ${theme.valueNegative}4D`,
        borderRadius: '2px',
        padding: '14px 24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: theme.valueNegative, fontWeight: 500 }}>
            Your free trial has ended.
          </span>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: theme.textMuted, marginLeft: '8px' }}>
            Upgrade to continue using Dynasty.
          </span>
        </div>
        <button
          onClick={() => router.push('/upgrade')}
          style={{
            background: theme.accentGradient,
            color: theme.textOnAccent,
            fontFamily: "'Jost', sans-serif",
            fontWeight: 600,
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '8px 24px',
            borderRadius: '1px',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Upgrade Now
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.accent}1A, ${theme.accent}08)`,
      border: `1px solid ${theme.accent}33`,
      borderRadius: '2px',
      padding: '12px 24px',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      <span style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: '12px',
        color: theme.accent,
        letterSpacing: '0.06em',
      }}>
        ◆ Free trial — {remaining} of {FREE_TRIAL_MAX_SESSIONS} sessions remaining
      </span>
      <button
        onClick={() => router.push('/upgrade')}
        style={{
          background: 'transparent',
          border: `1px solid ${theme.accent}4D`,
          color: theme.accent,
          fontFamily: "'Jost', sans-serif",
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          padding: '6px 18px',
          borderRadius: '1px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        View Plans
      </button>
    </div>
  )
}
