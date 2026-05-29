'use client'

import { useState, useEffect } from 'react'
import { Check, X, Crown, Zap, Building2, Gift } from 'lucide-react'
import { PLAN_FEATURES, FREE_TRIAL_MAX_SESSIONS, getSessionsRemaining } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

interface PlanDef {
  key: PlanId
  label: string
  price: string
  properties: string
  icon: React.ReactNode
  features: { label: string; included: boolean }[]
  popular?: boolean
  isFree?: boolean
}

function buildFeatureList(plan: PlanId) {
  const f = PLAN_FEATURES[plan]
  return [
    { label: `Up to ${f.maxProperties === 999 ? 'unlimited' : f.maxProperties} properties`, included: true },
    { label: 'Income & expense tracking', included: f.transactions },
    { label: 'Recurring payments', included: f.recurringPayments },
    { label: 'Financial reports', included: f.reports },
    { label: 'AI receipt scanner', included: f.receiptScanner },
    { label: 'ROI calculator', included: f.roiCalculator },
    { label: 'CSV export', included: f.exportCSV },
    { label: 'PDF export', included: f.exportPDF },
    { label: 'Listings sync', included: f.listingsSync },
    { label: 'API access', included: f.apiAccess },
    { label: 'Priority support', included: f.prioritySupport },
  ]
}

const PLANS: PlanDef[] = [
  {
    key: 'free',
    label: 'Free Trial',
    price: 'Free',
    properties: 'Up to 20 properties',
    icon: <Gift style={{ width: '20px', height: '20px' }} strokeWidth={1.2} />,
    features: buildFeatureList('free'),
    isFree: true,
  },
  {
    key: 'starter',
    label: 'Starter',
    price: '$29 CAD/mo',
    properties: 'Up to 5 properties',
    icon: <Building2 style={{ width: '20px', height: '20px' }} strokeWidth={1.2} />,
    features: buildFeatureList('starter'),
  },
  {
    key: 'landlord',
    label: 'Landlord',
    price: '$79 CAD/mo',
    properties: 'Up to 20 properties',
    icon: <Zap style={{ width: '20px', height: '20px' }} strokeWidth={1.2} />,
    features: buildFeatureList('landlord'),
    popular: true,
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    price: '$149 CAD/mo',
    properties: 'Unlimited properties',
    icon: <Crown style={{ width: '20px', height: '20px' }} strokeWidth={1.2} />,
    features: buildFeatureList('portfolio'),
  },
]

interface UpgradeClientProps {
  currentPlan: PlanId
  sessionsUsed: number
  hasSubscription: boolean
  success: boolean
  canceled: boolean
}

export function UpgradeClient({ currentPlan, sessionsUsed, hasSubscription, success, canceled }: UpgradeClientProps) {
  const [loading, setLoading] = useState<PlanId | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (success) setToast({ msg: 'Subscription activated — welcome to your new plan!', type: 'success' })
    else if (canceled) setToast({ msg: 'Checkout canceled. No charge was made.', type: 'error' })
  }, [success, canceled])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  async function handleSubscribe(plan: PlanId) {
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { setToast({ msg: data.error ?? 'Something went wrong', type: 'error' }); setLoading(null) }
    } catch {
      setToast({ msg: 'Network error — please try again', type: 'error' })
      setLoading(null)
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { setToast({ msg: data.error ?? 'Could not open billing portal', type: 'error' }); setPortalLoading(false) }
    } catch {
      setToast({ msg: 'Network error — please try again', type: 'error' })
      setPortalLoading(false)
    }
  }

  const remaining = getSessionsRemaining(sessionsUsed)

  return (
    <div style={{ position: 'relative' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '14px 20px', borderRadius: '2px',
          border: toast.type === 'success' ? '1px solid rgba(201,168,76,0.40)' : '1px solid rgba(183,110,121,0.40)',
          background: toast.type === 'success' ? 'rgba(201,168,76,0.10)' : 'rgba(183,110,121,0.10)',
          color: toast.type === 'success' ? '#C9A84C' : '#D4959E',
          fontFamily: "'Jost', sans-serif", fontSize: '13px', fontWeight: 300,
          letterSpacing: '0.04em', backdropFilter: 'blur(8px)', maxWidth: '360px',
        }}>
          {toast.msg}
        </div>
      )}

      {hasSubscription && (
        <div style={{
          marginBottom: '24px', padding: '16px 24px',
          border: '1px solid rgba(201,168,76,0.15)', borderRadius: '2px',
          background: 'rgba(201,168,76,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', letterSpacing: '0.06em', color: '#C9A84C', margin: 0 }}>
              You have an active subscription
            </p>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 300, color: '#6B6B65', margin: '4px 0 0 0' }}>
              Manage payment method, invoices, or cancel via the billing portal.
            </p>
          </div>
          <button
            onClick={handleManageBilling} disabled={portalLoading}
            style={{
              padding: '10px 20px', border: '1px solid rgba(201,168,76,0.30)', borderRadius: '2px',
              background: 'transparent', color: '#C9A84C', fontFamily: "'Jost', sans-serif",
              fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: portalLoading ? 'not-allowed' : 'pointer', opacity: portalLoading ? 0.6 : 1,
              transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            }}
          >
            {portalLoading ? 'Opening…' : 'Manage Billing'}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key
          const isLoading = loading === plan.key

          return (
            <div key={plan.key} style={{
              position: 'relative', padding: '28px 24px', borderRadius: '2px',
              border: plan.popular
                ? '1px solid rgba(201,168,76,0.50)'
                : plan.isFree
                  ? '1px solid rgba(201,168,76,0.20)'
                  : '1px solid rgba(201,168,76,0.12)',
              background: plan.popular ? 'rgba(201,168,76,0.04)' : '#111111',
              boxShadow: plan.popular
                ? '0 4px 32px rgba(201,168,76,0.10), 0 0 0 1px rgba(201,168,76,0.08)'
                : '0 4px 20px rgba(0,0,0,0.35)',
              display: 'flex', flexDirection: 'column', gap: '18px',
            }}>
              {/* Corner marks */}
              <div style={{ position: 'absolute', top: '6px', left: '6px', width: '12px', height: '12px', borderTop: '1px solid rgba(201,168,76,0.28)', borderLeft: '1px solid rgba(201,168,76,0.28)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '12px', height: '12px', borderBottom: '1px solid rgba(201,168,76,0.28)', borderRight: '1px solid rgba(201,168,76,0.28)', pointerEvents: 'none' }} />

              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  padding: '4px 16px', background: 'linear-gradient(135deg, #C9A84C 0%, #9A7A2E 100%)',
                  borderRadius: '1px', fontFamily: "'Jost', sans-serif", fontSize: '8px',
                  letterSpacing: '0.22em', textTransform: 'uppercase', color: '#080808',
                  fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  Most Popular
                </div>
              )}

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', border: '1px solid rgba(201,168,76,0.18)',
                  borderRadius: '2px', color: '#C9A84C', background: 'rgba(201,168,76,0.06)', flexShrink: 0,
                }}>
                  {plan.icon}
                </div>
                <div>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', letterSpacing: '0.20em', textTransform: 'uppercase', color: '#C9A84C', margin: 0 }}>
                    {plan.label}
                  </p>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '10px', fontWeight: 300, letterSpacing: '0.06em', color: '#6B6B65', margin: '3px 0 0 0' }}>
                    {plan.properties}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div style={{ borderTop: '1px solid rgba(201,168,76,0.08)', paddingTop: '16px' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '30px', fontWeight: 500, letterSpacing: '0.01em', color: '#FAF7F2', margin: 0, lineHeight: 1 }}>
                  {plan.isFree ? (
                    <span>Free</span>
                  ) : (
                    <>
                      {plan.price.split(' ')[0]}
                      <span style={{ fontSize: '13px', color: '#6B6B65', fontFamily: "'Jost', sans-serif", fontWeight: 300, marginLeft: '6px' }}>
                        CAD / mo
                      </span>
                    </>
                  )}
                </p>
                {plan.isFree && isCurrent && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '10px', color: remaining > 1 ? '#C9A84C' : '#B76E79', letterSpacing: '0.06em' }}>
                        {remaining} of {FREE_TRIAL_MAX_SESSIONS} sessions remaining
                      </span>
                    </div>
                    <div style={{ height: '3px', background: 'rgba(201,168,76,0.15)', borderRadius: '1px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '1px',
                        width: `${(sessionsUsed / FREE_TRIAL_MAX_SESSIONS) * 100}%`,
                        background: remaining > 1 ? 'linear-gradient(90deg, #C9A84C, #9A7A2E)' : '#B76E79',
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                    {f.included ? (
                      <Check style={{ width: '12px', height: '12px', color: '#C9A84C', flexShrink: 0, marginTop: '2px' }} strokeWidth={2.5} />
                    ) : (
                      <X style={{ width: '12px', height: '12px', color: '#3A3A35', flexShrink: 0, marginTop: '2px' }} strokeWidth={2} />
                    )}
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 300, color: f.included ? '#8A8A82' : '#3A3A35', letterSpacing: '0.04em' }}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div style={{ paddingTop: '6px' }}>
                {isCurrent ? (
                  <div style={{
                    width: '100%', padding: '11px', textAlign: 'center',
                    border: '1px solid rgba(201,168,76,0.25)', borderRadius: '1px',
                    fontFamily: "'Jost', sans-serif", fontSize: '10px', letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: '#C9A84C', background: 'rgba(201,168,76,0.06)',
                  }}>
                    ◆ Current Plan
                  </div>
                ) : plan.isFree ? null : (
                  <button
                    onClick={() => handleSubscribe(plan.key)}
                    disabled={isLoading || !!loading}
                    style={{
                      width: '100%', padding: '11px', borderRadius: '1px', border: 'none',
                      background: plan.popular ? 'linear-gradient(135deg, #C9A84C 0%, #9A7A2E 100%)' : 'transparent',
                      color: plan.popular ? '#080808' : '#C9A84C',
                      fontFamily: "'Jost', sans-serif", fontSize: '10px', letterSpacing: '0.18em',
                      textTransform: 'uppercase', fontWeight: plan.popular ? 600 : 400,
                      cursor: isLoading || !!loading ? 'not-allowed' : 'pointer',
                      opacity: !!loading && !isLoading ? 0.5 : 1,
                      transition: 'all 0.25s ease',
                      outline: plan.popular ? 'none' : '1px solid rgba(201,168,76,0.30)',
                      boxShadow: plan.popular ? '0 4px 16px rgba(201,168,76,0.22)' : 'none',
                    }}
                  >
                    {isLoading ? 'Redirecting…' : 'Subscribe'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p style={{
        marginTop: '24px', fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 300,
        letterSpacing: '0.04em', color: '#4A4A45', textAlign: 'center',
      }}>
        All prices in Canadian dollars. Billed monthly. Cancel anytime via the billing portal.
      </p>
    </div>
  )
}
