'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { PlanFeatures, PlanId, PLAN_FEATURES } from '@/lib/plans'
import { useAppTheme } from '@/lib/theme-context'

interface FeatureGateProps {
  feature: keyof PlanFeatures
  plan: PlanId
  trialExpired: boolean
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureGate({ feature, plan, trialExpired, children, fallback }: FeatureGateProps) {
  if (plan === 'free' && !trialExpired) return <>{children}</>
  if (plan === 'free' && trialExpired) return <>{fallback ?? <UpgradePrompt feature={feature} />}</>

  const val = PLAN_FEATURES[plan][feature]
  const hasAccess = val === true || (typeof val === 'number' && val > 0)
  if (hasAccess) return <>{children}</>

  return <>{fallback ?? <UpgradePrompt feature={feature} />}</>
}

const FEATURE_NAMES: Record<string, string> = {
  receiptScanner:   'Receipt Scanner',
  roiCalculator:    'ROI Calculator',
  exportPDF:        'PDF Export',
  aiInsights:       'AI Insights',
  listingsSync:     'Listings Sync',
  apiAccess:        'API Access',
  prioritySupport:  'Priority Support',
  reports:          'Reports',
  recurringPayments:'Recurring Payments',
}

function UpgradePrompt({ feature }: { feature: string }) {
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
        fontSize: '22px',
        fontWeight: 600,
        color: theme.textPrimary,
        marginBottom: '8px',
        letterSpacing: '0.02em',
      }}>
        {FEATURE_NAMES[feature] ?? feature} requires an upgrade
      </h3>
      <p style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: '13px',
        fontWeight: 300,
        color: theme.textMuted,
        marginBottom: '24px',
        letterSpacing: '0.04em',
      }}>
        Unlock this feature by upgrading your Dynasty plan
      </p>
      <button
        onClick={() => router.push('/upgrade')}
        style={{
          background: theme.accentGradient,
          color: theme.textOnAccent,
          fontFamily: "'Jost', sans-serif",
          fontWeight: 600,
          fontSize: '10px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          padding: '12px 36px',
          borderRadius: '1px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: `0 4px 16px ${theme.accent}33`,
        }}
      >
        View Plans
      </button>
    </div>
  )
}
