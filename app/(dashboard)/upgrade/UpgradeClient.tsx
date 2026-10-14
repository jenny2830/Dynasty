'use client'

import { useState, useEffect } from 'react'
import { Check, Crown } from 'lucide-react'
import { MEMBERSHIP, MEMBERSHIP_FEATURES, FREE_TRIAL_MAX_SESSIONS, getSessionsRemaining } from '@/lib/plans'
import { useAppTheme } from '@/lib/theme-context'

interface UpgradeClientProps {
  isMember: boolean
  sessionsUsed: number
  trialExpired: boolean
  success: boolean
  canceled: boolean
}

export function UpgradeClient({
  isMember,
  sessionsUsed,
  trialExpired,
  success,
  canceled,
}: UpgradeClientProps) {
  const { theme } = useAppTheme()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (success) setToast({ msg: 'Membership activated — welcome to Dynasty!', type: 'success' })
    else if (canceled) setToast({ msg: 'Checkout canceled. No charge was made.', type: 'error' })
  }, [success, canceled])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  async function handleSubscribe() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setToast({ msg: data.error ?? 'Something went wrong', type: 'error' })
        setLoading(false)
      }
    } catch {
      setToast({ msg: 'Network error — please try again', type: 'error' })
      setLoading(false)
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setToast({ msg: data.error ?? 'Could not open billing portal', type: 'error' })
        setPortalLoading(false)
      }
    } catch {
      setToast({ msg: 'Network error — please try again', type: 'error' })
      setPortalLoading(false)
    }
  }

  const remaining = getSessionsRemaining(sessionsUsed)
  const plan = billing === 'monthly' ? MEMBERSHIP.monthly : MEMBERSHIP.yearly

  return (
    <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '14px 20px', borderRadius: '2px',
          border: toast.type === 'success'
            ? `1px solid ${theme.accent}66`
            : `1px solid ${theme.valueNegative}66`,
          background: toast.type === 'success'
            ? `${theme.accent}1A`
            : `${theme.valueNegative}1A`,
          color: toast.type === 'success' ? theme.accent : theme.valueNegative,
          fontFamily: "'Jost', sans-serif", fontSize: '15px', fontWeight: 400,
          letterSpacing: '0.04em', backdropFilter: 'blur(8px)', maxWidth: '360px',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Active membership banner */}
      {isMember && (
        <div style={{
          marginBottom: '28px', padding: '18px 24px',
          border: `1px solid ${theme.accent}33`, borderRadius: '2px',
          background: `${theme.accent}08`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Crown style={{ width: '16px', height: '16px', color: theme.accent }} strokeWidth={1.4} />
            <div>
              <p style={{
                fontFamily: "'Jost', sans-serif", fontSize: '14px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: theme.accent, margin: 0,
              }}>
                Dynasty Membership — Active
              </p>
              <p style={{
                fontFamily: "'Jost', sans-serif", fontSize: '14px',
                fontWeight: 400, color: theme.textMuted, margin: '4px 0 0 0',
              }}>
                Manage payment method, invoices, or cancel via the billing portal.
              </p>
            </div>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            style={{
              padding: '10px 20px', border: `1px solid ${theme.accent}4D`,
              borderRadius: '2px', background: 'transparent', color: theme.accent,
              fontFamily: "'Jost', sans-serif", fontSize: '14px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: portalLoading ? 'not-allowed' : 'pointer',
              opacity: portalLoading ? 0.6 : 1, whiteSpace: 'nowrap',
            }}
          >
            {portalLoading ? 'Opening…' : 'Manage Billing'}
          </button>
        </div>
      )}

      {/* Free trial progress (non-members only) */}
      {!isMember && !trialExpired && (
        <div style={{
          marginBottom: '28px', padding: '16px 20px',
          border: `1px solid ${theme.accent}26`, borderRadius: '2px',
          background: `${theme.accent}08`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{
              fontFamily: "'Jost', sans-serif", fontSize: '14px',
              letterSpacing: '0.06em',
              color: remaining > 1 ? theme.accent : theme.valueNegative,
            }}>
              ◆ Free trial — {remaining} of {FREE_TRIAL_MAX_SESSIONS} sessions remaining
            </span>
          </div>
          <div style={{ height: '2px', background: `${theme.accent}26`, borderRadius: '1px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(sessionsUsed / FREE_TRIAL_MAX_SESSIONS) * 100}%`,
              background: remaining > 1 ? theme.accentGradient : theme.valueNegative,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {/* ── Membership Card ── */}
      <div style={{
        position: 'relative', borderRadius: '2px',
        border: `1px solid ${theme.accent}66`,
        background: `${theme.accent}08`,
        boxShadow: `0 4px 32px ${theme.accent}18, 0 0 0 1px ${theme.accent}0F`,
        padding: '36px 32px',
        overflow: 'hidden',
      }}>
        {/* Art-deco corner marks */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', width: '16px', height: '16px', borderTop: `1px solid ${theme.cornerMark}`, borderLeft: `1px solid ${theme.cornerMark}`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '8px', right: '8px', width: '16px', height: '16px', borderTop: `1px solid ${theme.cornerMark}`, borderRight: `1px solid ${theme.cornerMark}`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '16px', height: '16px', borderBottom: `1px solid ${theme.cornerMark}`, borderLeft: `1px solid ${theme.cornerMark}`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '16px', height: '16px', borderBottom: `1px solid ${theme.cornerMark}`, borderRight: `1px solid ${theme.cornerMark}`, pointerEvents: 'none' }} />
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: theme.topLine }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '42px', height: '42px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: `1px solid ${theme.accent}40`,
            borderRadius: '2px', color: theme.accent, background: `${theme.accent}10`, flexShrink: 0,
          }}>
            <Crown style={{ width: '20px', height: '20px' }} strokeWidth={1.2} />
          </div>
          <div>
            <p style={{
              fontFamily: "'Jost', sans-serif", fontSize: '11px',
              letterSpacing: '0.26em', textTransform: 'uppercase',
              color: theme.textMuted, margin: 0,
            }}>
              All Access
            </p>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: '22px',
              fontWeight: 500, letterSpacing: '0.04em',
              color: theme.textPrimary, margin: '2px 0 0 0',
            }}>
              Dynasty Membership
            </p>
          </div>
        </div>

        {/* Billing toggle */}
        <div style={{
          display: 'inline-flex', gap: 0, borderRadius: '2px',
          border: `1px solid ${theme.accent}30`,
          overflow: 'hidden', margin: '24px 0',
        }}>
          {(['monthly', 'yearly'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: '8px 20px',
                background: billing === b ? theme.accentGradient : 'transparent',
                color: billing === b ? theme.textOnAccent : theme.textMuted,
                fontFamily: "'Jost', sans-serif", fontSize: '12px',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                fontWeight: billing === b ? 600 : 400,
              }}
            >
              {b === 'monthly' ? 'Monthly' : 'Yearly'}
              {b === 'yearly' && (
                <span style={{
                  marginLeft: '8px', padding: '2px 6px',
                  borderRadius: '1px', fontSize: '9px',
                  letterSpacing: '0.15em',
                  background: billing === 'yearly' ? 'rgba(255,255,255,0.25)' : `${theme.accent}26`,
                  color: billing === 'yearly' ? theme.textOnAccent : theme.accent,
                }}>
                  {MEMBERSHIP.yearly.savingsLabel}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Price display */}
        <div style={{ marginBottom: '28px', borderTop: `1px solid ${theme.dividerColor}`, paddingTop: '20px' }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: '42px',
            fontWeight: 500, letterSpacing: '0.01em',
            color: theme.textPrimary, margin: 0, lineHeight: 1,
          }}>
            {plan.priceDisplay}
            <span style={{
              fontFamily: "'Jost', sans-serif", fontSize: '15px',
              fontWeight: 400, color: theme.textMuted, marginLeft: '8px',
            }}>
              {plan.intervalLabel}
            </span>
          </p>
          {billing === 'yearly' && (
            <p style={{
              fontFamily: "'Jost', sans-serif", fontSize: '13px',
              fontWeight: 400, color: theme.textMuted,
              letterSpacing: '0.04em', margin: '8px 0 0 0',
            }}>
              {MEMBERSHIP.yearly.monthlyEquivalent}
            </p>
          )}
        </div>

        {/* Feature list */}
        <ul style={{
          listStyle: 'none', padding: 0, margin: '0 0 28px 0',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
        }}>
          {MEMBERSHIP_FEATURES.map((f) => (
            <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
              <Check
                style={{ width: '12px', height: '12px', color: theme.accent, flexShrink: 0, marginTop: '3px' }}
                strokeWidth={2.5}
              />
              <span style={{
                fontFamily: "'Jost', sans-serif", fontSize: '14px',
                fontWeight: 400, letterSpacing: '0.04em',
                color: theme.textSecondary,
              }}>
                {f}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {isMember ? (
          <div style={{
            width: '100%', padding: '13px', textAlign: 'center',
            border: `1px solid ${theme.accent}40`, borderRadius: '1px',
            fontFamily: "'Jost', sans-serif", fontSize: '13px',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: theme.accent, background: `${theme.accent}0F`,
          }}>
            ◆ Membership Active
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '1px', border: 'none',
              background: theme.accentGradient, color: theme.textOnAccent,
              fontFamily: "'Jost', sans-serif", fontSize: '14px',
              letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: `0 4px 20px ${theme.accent}40`,
              transition: 'all 0.25s ease',
            }}
          >
            {loading ? 'Redirecting…' : 'Become a Member'}
          </button>
        )}
      </div>

      <p style={{
        marginTop: '20px', fontFamily: "'Jost', sans-serif", fontSize: '14px',
        fontWeight: 400, letterSpacing: '0.04em', color: theme.textMuted,
        textAlign: 'center',
      }}>
        All prices in Canadian dollars. Cancel anytime via the billing portal.
      </p>
    </div>
  )
}
