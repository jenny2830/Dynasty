'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { PlanFeatures, PlanId, PLAN_FEATURES } from '@/lib/plans'

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

  return (
    <div style={{
      background: 'linear-gradient(160deg, #141414, #1A1815)',
      border: '1px solid rgba(201,168,76,0.15)',
      borderRadius: '2px',
      padding: '48px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '6px', left: '6px', width: '14px', height: '14px', borderTop: '1px solid rgba(201,168,76,0.5)', borderLeft: '1px solid rgba(201,168,76,0.5)' }} />
      <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '14px', height: '14px', borderBottom: '1px solid rgba(201,168,76,0.5)', borderRight: '1px solid rgba(201,168,76,0.5)' }} />

      <div style={{ fontSize: '32px', marginBottom: '12px' }}>◆</div>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '22px',
        fontWeight: 600,
        color: '#FAF7F2',
        marginBottom: '8px',
        letterSpacing: '0.02em',
      }}>
        {FEATURE_NAMES[feature] ?? feature} requires an upgrade
      </h3>
      <p style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: '13px',
        fontWeight: 300,
        color: '#6B6B65',
        marginBottom: '24px',
        letterSpacing: '0.04em',
      }}>
        Unlock this feature by upgrading your Dynasty plan
      </p>
      <button
        onClick={() => router.push('/upgrade')}
        style={{
          background: 'linear-gradient(135deg, #C9A84C 0%, #9A7A2E 100%)',
          color: '#080808',
          fontFamily: "'Jost', sans-serif",
          fontWeight: 600,
          fontSize: '10px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          padding: '12px 36px',
          borderRadius: '1px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(201,168,76,0.2)',
        }}
      >
        View Plans
      </button>
    </div>
  )
}
