'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAppTheme } from '@/lib/theme-context'

interface FeatureGateProps {
  /** When true, the feature is accessible (landlord has an active membership). */
  isMember: boolean
  children: ReactNode
  fallback?: ReactNode
  featureLabel?: string
}

/**
 * Renders `children` when the landlord is an active member.
 * Non-members see `fallback`, or the default upgrade prompt.
 *
 * Single membership = no tiers to check; the only gate is member vs. non-member.
 */
export function FeatureGate({ isMember, children, fallback, featureLabel }: FeatureGateProps) {
  if (isMember) return <>{children}</>
  return <>{fallback ?? <UpgradePrompt featureLabel={featureLabel} />}</>
}

function UpgradePrompt({ featureLabel }: { featureLabel?: string }) {
  const router = useRouter()
  const { theme } = useAppTheme()

  return (
    <div style={{
      background: theme.cardBg,
      border: theme.cardBorder,
      borderRadius: '2px',
      padding: '48px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '6px', left: '6px', width: '14px', height: '14px', borderTop: `1px solid ${theme.cornerMark}`, borderLeft: `1px solid ${theme.cornerMark}` }} />
      <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '14px', height: '14px', borderBottom: `1px solid ${theme.cornerMark}`, borderRight: `1px solid ${theme.cornerMark}` }} />

      <div style={{ fontSize: '32px', marginBottom: '12px', color: theme.accent }}>◆</div>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '26px',
        fontWeight: 600,
        color: theme.textPrimary,
        marginBottom: '8px',
        letterSpacing: '0.02em',
      }}>
        {featureLabel ? `${featureLabel} — Members Only` : 'Dynasty Membership required'}
      </h3>
      <p style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: '15px',
        fontWeight: 400,
        color: theme.textMuted,
        marginBottom: '24px',
        letterSpacing: '0.04em',
      }}>
        Become a member to unlock every feature — unlimited properties, reports, AI scanner, and more.
      </p>
      <button
        onClick={() => router.push('/upgrade')}
        style={{
          background: theme.accentGradient,
          color: theme.textOnAccent,
          fontFamily: "'Jost', sans-serif",
          fontWeight: 600,
          fontSize: '12px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          padding: '12px 36px',
          borderRadius: '1px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: `0 4px 16px ${theme.accent}33`,
        }}
      >
        Become a Member
      </button>
    </div>
  )
}
