'use client'

import { useEffect, useState } from 'react'
import { Palette, Type, KeyRound, Check, CreditCard, Crown } from 'lucide-react'
import Link from 'next/link'
import { Section, SectionHeader } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useAppTheme, type TextThickness } from '@/lib/theme-context'
import { type ThemeId, THEMES, THEME_META } from '@/lib/themes'

type TextSize = 'sm' | 'md' | 'lg'

const TEXT_SIZES: { value: TextSize; label: string; hint: string }[] = [
  { value: 'sm', label: 'Compact', hint: 'Smaller' },
  { value: 'md', label: 'Standard', hint: 'Default' },
  { value: 'lg', label: 'Large', hint: 'Bigger' },
]

const PLAN_LABELS: Record<string, { label: string; price: string }> = {
  free:      { label: 'Free Trial', price: 'Free' },
  starter:   { label: 'Starter',   price: '$29 CAD/mo' },
  landlord:  { label: 'Landlord',  price: '$79 CAD/mo' },
  portfolio: { label: 'Portfolio', price: '$149 CAD/mo' },
}

interface SettingsPanelProps {
  currentPlan?: 'free' | 'starter' | 'landlord' | 'portfolio'
  hasSubscription?: boolean
}

export function SettingsPanel({ currentPlan = 'free', hasSubscription = false }: SettingsPanelProps) {
  const { themeId, theme, setThemeId, textThickness, setTextThickness } = useAppTheme()
  const [mounted, setMounted] = useState(false)
  const [textSize, setTextSize] = useState<TextSize>('md')

  // Password form state
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [pwMessage, setPwMessage] = useState('')

  // Billing portal state
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedSize = localStorage.getItem('dynasty-text-size')
    if (savedSize === 'sm' || savedSize === 'md' || savedSize === 'lg') {
      setTextSize(savedSize)
    }
  }, [])

  function applyTextSize(size: TextSize) {
    setTextSize(size)
    localStorage.setItem('dynasty-text-size', size)
    document.documentElement.dataset.textSize = size
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwMessage('')

    if (password.length < 8) {
      setPwStatus('error')
      setPwMessage('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setPwStatus('error')
      setPwMessage('Passwords do not match.')
      return
    }

    setPwStatus('saving')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setPwStatus('error')
      setPwMessage(error.message)
      return
    }

    setPwStatus('success')
    setPwMessage('Password updated successfully.')
    setPassword('')
    setConfirm('')
  }

  async function handleManageBilling() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setPortalLoading(false)
    }
  }

  const planInfo = PLAN_LABELS[currentPlan] ?? PLAN_LABELS.starter

  return (
    <div className="space-y-6">
      {/* ── Appearance ── */}
      <Section>
        <SectionHeader title="Appearance" description="Color theme & text size" />
        <div className="space-y-8 px-7 py-7">

          {/* Color Theme — 4-theme selector */}
          <div>
            <p style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Jost', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: theme.textMuted,
              margin: '0 0 16px 0',
            }}>
              <Palette style={{ width: '13px', height: '13px' }} strokeWidth={1.4} />
              Color Theme
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {(Object.keys(THEMES) as ThemeId[]).map((id) => {
                const meta = THEME_META[id]
                const t = THEMES[id]
                const isSelected = mounted && id === themeId

                return (
                  <button
                    key={id}
                    onClick={() => setThemeId(id)}
                    style={{
                      position: 'relative',
                      background: t.cardBg,
                      border: isSelected
                        ? `2px solid ${t.accent}`
                        : t.cardBorder,
                      borderRadius: '2px',
                      padding: '16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Top accent line preview */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '15%',
                      right: '15%',
                      height: isSelected ? '2px' : '1px',
                      background: t.topLine,
                    }} />

                    {/* Color swatches */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: t.sidebarBg, border: '1px solid rgba(128,128,128,0.3)', flexShrink: 0 }} />
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: t.accent, border: '1px solid rgba(128,128,128,0.3)', flexShrink: 0 }} />
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: t.pageBg, border: '1px solid rgba(128,128,128,0.3)', flexShrink: 0 }} />
                    </div>

                    <p style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '11px',
                      fontWeight: 500,
                      color: t.textPrimary,
                      letterSpacing: '0.08em',
                      margin: '0 0 3px 0',
                      textTransform: 'uppercase',
                    }}>
                      {meta.name}
                    </p>
                    <p style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '10px',
                      color: t.textMuted,
                      letterSpacing: '0.04em',
                      margin: 0,
                    }}>
                      {meta.description}
                    </p>

                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        fontSize: '8px',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '1px',
                        background: `${t.accent}20`,
                        color: t.accent,
                        border: `1px solid ${t.accent}40`,
                        fontFamily: "'Jost', sans-serif",
                        fontWeight: 500,
                      }}>
                        Active
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <p style={{
              marginTop: '12px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: theme.textMuted,
            }}>
              Changes the entire interface — sidebar, cards, accents, and all text.
            </p>
          </div>

          {/* Text Thickness */}
          <div>
            <p style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Jost', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: theme.textMuted,
              margin: '0 0 8px 0',
            }}>
              <Type style={{ width: '13px', height: '13px' }} strokeWidth={1.4} />
              Text Thickness
            </p>
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: theme.textMuted,
              margin: '0 0 14px 0',
            }}>
              Adjust text weight across the entire platform for better visibility.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {(['light', 'regular', 'bold'] as const).map((weight: TextThickness) => {
                const isSelected = mounted && weight === textThickness
                const previewWeights = {
                  light:   { label: 200, sample: 200 },
                  regular: { label: 400, sample: 500 },
                  bold:    { label: 600, sample: 800 },
                } as const

                return (
                  <button
                    key={weight}
                    onClick={() => setTextThickness(weight)}
                    style={{
                      flex: '1 1 120px',
                      position: 'relative',
                      background: theme.cardBg,
                      border: isSelected
                        ? `2px solid ${theme.accent}`
                        : theme.cardBorder,
                      borderRadius: '2px',
                      padding: '20px 14px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.3s',
                      overflow: 'hidden',
                    }}
                  >
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 0, left: '15%', right: '15%',
                        height: '2px', background: theme.topLine,
                      }} />
                    )}

                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: previewWeights[weight].sample,
                      fontSize: '28px',
                      color: theme.textPrimary,
                      margin: '0 0 4px 0',
                      lineHeight: 1,
                    }}>
                      Aa
                    </p>

                    <p style={{
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: previewWeights[weight].label,
                      fontSize: '11px',
                      color: theme.textSecondary,
                      margin: '0 0 8px 0',
                      letterSpacing: '0.02em',
                    }}>
                      $12,450.00 monthly
                    </p>

                    <p style={{
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: previewWeights[weight].label === 200 ? 300 : previewWeights[weight].label,
                      fontSize: '10px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: isSelected ? theme.accent : theme.textMuted,
                      margin: 0,
                    }}>
                      {weight}
                    </p>

                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: '6px', right: '6px',
                        fontSize: '8px', letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        padding: '2px 6px', borderRadius: '1px',
                        background: `${theme.accent}20`,
                        color: theme.accent,
                        fontFamily: "'Jost', sans-serif",
                      }}>
                        Active
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <p style={{
              marginTop: '10px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: theme.textMuted,
            }}>
              Saved to your account — synced across all devices.
            </p>
          </div>

          {/* Text size */}
          <div>
            <p style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Jost', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: theme.textMuted,
              margin: '0 0 12px 0',
            }}>
              <Type style={{ width: '13px', height: '13px' }} strokeWidth={1.4} />
              Text Size
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {TEXT_SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => applyTextSize(s.value)}
                  style={{
                    flex: 1,
                    minWidth: '92px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '11px 14px',
                    background: mounted && textSize === s.value ? `${theme.accent}1A` : 'transparent',
                    border: mounted && textSize === s.value
                      ? `1px solid ${theme.accent}73`
                      : `1px solid ${theme.accent}26`,
                    borderRadius: '2px',
                    color: mounted && textSize === s.value ? theme.accent : theme.textMuted,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p style={{
              marginTop: '10px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: theme.textMuted,
            }}>
              Scales the content area proportionally so the layout stays intact.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Security ── */}
      <Section>
        <SectionHeader title="Security" description="Change your password" />
        <form onSubmit={handlePasswordChange} className="space-y-5 px-7 py-7">
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {pwMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '1px',
                padding: '10px 14px',
                border: pwStatus === 'success'
                  ? `1px solid ${theme.badgePositiveBorder}`
                  : `1px solid ${theme.badgeNegativeBorder}`,
                background: pwStatus === 'success'
                  ? theme.badgePositiveBg
                  : theme.badgeNegativeBg,
                color: pwStatus === 'success' ? theme.badgePositiveText : theme.badgeNegativeText,
                fontFamily: "'Jost', sans-serif",
                fontSize: '12px',
                fontWeight: 300,
              }}
            >
              {pwStatus === 'success' && <Check style={{ width: '14px', height: '14px' }} strokeWidth={1.6} />}
              {pwMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button type="submit" disabled={pwStatus === 'saving'} className="w-full sm:w-auto">
              <KeyRound />
              {pwStatus === 'saving' ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Section>

      {/* ── Billing ── */}
      <Section>
        <SectionHeader title="Billing" description="Plan & subscription" />
        <div className="space-y-5 px-7 py-7">
          {/* Current plan display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '16px 20px',
            border: theme.cardBorder,
            borderRadius: '2px',
            background: `${theme.accent}08`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Crown style={{ width: '16px', height: '16px', color: theme.accent }} strokeWidth={1.4} />
              <div>
                <p style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: theme.textMuted,
                  margin: 0,
                }}>
                  Current Plan
                </p>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '20px',
                  fontWeight: 500,
                  color: theme.textPrimary,
                  margin: '4px 0 0 0',
                  letterSpacing: '0.02em',
                }}>
                  {planInfo.label}
                  <span style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '12px',
                    fontWeight: 300,
                    color: theme.textMuted,
                    marginLeft: '10px',
                  }}>
                    {planInfo.price}
                  </span>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {hasSubscription && (
                <button
                  type="button"
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 16px',
                    border: `1px solid ${theme.accent}47`,
                    borderRadius: '1px',
                    background: 'transparent',
                    color: theme.accent,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '10px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: portalLoading ? 'not-allowed' : 'pointer',
                    opacity: portalLoading ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CreditCard style={{ width: '12px', height: '12px' }} strokeWidth={1.4} />
                  {portalLoading ? 'Opening…' : 'Manage Billing'}
                </button>
              )}
              <Link
                href="/upgrade"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '9px 16px',
                  border: 'none',
                  borderRadius: '1px',
                  background: theme.accentGradient,
                  color: theme.textOnAccent,
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: `0 4px 14px ${theme.accent}33`,
                }}
              >
                <Crown style={{ width: '12px', height: '12px' }} strokeWidth={1.8} />
                Upgrade Plan
              </Link>
            </div>
          </div>

          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            fontSize: '11px',
            letterSpacing: '0.04em',
            color: theme.textMuted,
            margin: 0,
          }}>
            {hasSubscription
              ? 'Manage your payment method, download invoices, or cancel via the billing portal.'
              : 'Subscribe to unlock more properties and advanced features.'}
          </p>
        </div>
      </Section>
    </div>
  )
}
