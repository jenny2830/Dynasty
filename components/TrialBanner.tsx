'use client'

import { useRouter } from 'next/navigation'
import { getSessionsRemaining, FREE_TRIAL_MAX_SESSIONS } from '@/lib/plans'

interface TrialBannerProps {
  plan: string
  sessionsUsed: number
  trialExpired: boolean
}

export function TrialBanner({ plan, sessionsUsed, trialExpired }: TrialBannerProps) {
  const router = useRouter()
  if (plan !== 'free') return null

  const remaining = getSessionsRemaining(sessionsUsed)

  if (trialExpired) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(183,110,121,0.15), rgba(183,110,121,0.05))',
        border: '1px solid rgba(183,110,121,0.3)',
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
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#B76E79', fontWeight: 500 }}>
            Your free trial has ended.
          </span>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#6B6B65', marginLeft: '8px' }}>
            Upgrade to continue using Dynasty.
          </span>
        </div>
        <button
          onClick={() => router.push('/upgrade')}
          style={{
            background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)',
            color: '#080808',
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
      background: 'linear-gradient(135deg, rgba(201,168,76,0.10), rgba(201,168,76,0.03))',
      border: '1px solid rgba(201,168,76,0.20)',
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
        color: '#C9A84C',
        letterSpacing: '0.06em',
      }}>
        ◆ Free trial — {remaining} of {FREE_TRIAL_MAX_SESSIONS} sessions remaining
      </span>
      <button
        onClick={() => router.push('/upgrade')}
        style={{
          background: 'transparent',
          border: '1px solid rgba(201,168,76,0.3)',
          color: '#C9A84C',
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
