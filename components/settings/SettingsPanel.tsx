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
import { type ThemeId, THEMES } from '@/lib/themes'
import { useLocale } from '@/lib/locale-context'
import { themeHelp, themeName } from '@/lib/i18n/labels'
import { translateKnownError } from '@/lib/i18n/translate'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { formatCurrency } from '@/lib/utils'

type TextSize = 'sm' | 'md' | 'lg'

const TEXT_SIZES: { value: TextSize; label: string; hint: string }[] = [
  { value: 'sm', label: 'Compact', hint: 'Smaller' },
  { value: 'md', label: 'Standard', hint: 'Default' },
  { value: 'lg', label: 'Large', hint: 'Bigger' },
]

interface SettingsPanelProps {
  isMember?: boolean
  // Legacy prop kept for backward compatibility — prefer isMember
  currentPlan?: string
  hasSubscription?: boolean
}

export function SettingsPanel({ isMember = false, currentPlan = 'free', hasSubscription }: SettingsPanelProps) {
  const { themeId, theme, setThemeId, textThickness, setTextThickness } = useAppTheme()
  const { t, locale } = useLocale()
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

  // Derive membership from either the new prop or the legacy plan/hasSubscription props
  const activeMember = isMember || hasSubscription || (currentPlan && currentPlan !== 'free')

  const planInfo = activeMember
    ? { label: t('settings.membership'), price: t('settings.membershipPrice') }
    : { label: t('settings.freeTrial'), price: t('settings.free') }

  return (
    <div className="space-y-6">
      <Section>
        <SectionHeader title={t('settings.language')} description={t('settings.languageHelp')} />
        <div className="px-7 py-7">
          <LanguageSwitcher variant="sidebar" />
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section>
        <SectionHeader title={t('settings.appearance')} description={t('settings.appearanceHelp')} />
        <div className="space-y-8 px-7 py-7">

          {/* Color Theme — 4-theme selector */}
          <div>
            <p style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Jost', sans-serif",
              fontSize: '14px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: theme.textMuted,
              margin: '0 0 16px 0',
            }}>
              <Palette style={{ width: '13px', height: '13px' }} strokeWidth={1.4} />
              {t('settings.colorTheme')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {(Object.keys(THEMES) as ThemeId[]).map((id) => {
                const swatch = THEMES[id]
                const isSelected = mounted && id === themeId

                return (
                  <button
                    key={id}
                    onClick={() => setThemeId(id)}
                    style={{
                      position: 'relative',
                      background: swatch.cardBg,
                      border: isSelected
                        ? `2px solid ${swatch.accent}`
                        : swatch.cardBorder,
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
                      background: swatch.topLine,
                    }} />

                    {/* Color swatches */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: swatch.sidebarBg, border: '1px solid rgba(128,128,128,0.3)', flexShrink: 0 }} />
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: swatch.accent, border: '1px solid rgba(128,128,128,0.3)', flexShrink: 0 }} />
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: swatch.pageBg, border: '1px solid rgba(128,128,128,0.3)', flexShrink: 0 }} />
                    </div>

                    <p style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '15px',
                      fontWeight: 500,
                      color: swatch.textPrimary,
                      letterSpacing: '0.08em',
                      margin: '0 0 3px 0',
                      textTransform: 'uppercase',
                    }}>
                      {themeName(id, t)}
                    </p>
                    <p style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '14px',
                      color: swatch.textMuted,
                      letterSpacing: '0.04em',
                      margin: 0,
                    }}>
                      {themeHelp(id, t)}
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
                        background: `${swatch.accent}20`,
                        color: swatch.accent,
                        border: `1px solid ${swatch.accent}40`,
                        fontFamily: "'Jost', sans-serif",
                        fontWeight: 500,
                      }}>
                        {t('common.active')}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <p style={{
              marginTop: '12px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 400,
              fontSize: '15px',
              letterSpacing: '0.04em',
              color: theme.textMuted,
            }}>
              {t('settings.themeHelp')}
            </p>
          </div>

          {/* Text Thickness */}
          <div>
            <p style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Jost', sans-serif",
              fontSize: '14px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: theme.textMuted,
              margin: '0 0 8px 0',
            }}>
              <Type style={{ width: '13px', height: '13px' }} strokeWidth={1.4} />
              {t('settings.thickness')}
            </p>
            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 400,
              fontSize: '15px',
              letterSpacing: '0.04em',
              color: theme.textMuted,
              margin: '0 0 14px 0',
            }}>
              {t('settings.thicknessHelp')}
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
                      fontSize: '15px',
                      color: theme.textSecondary,
                      margin: '0 0 8px 0',
                      letterSpacing: '0.02em',
                    }}>
                      {t('settings.sampleAmount', { amount: formatCurrency(12450, 'CAD', 2, locale) })}
                    </p>

                    <p style={{
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: previewWeights[weight].label === 200 ? 300 : previewWeights[weight].label,
                      fontSize: '14px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: isSelected ? theme.accent : theme.textMuted,
                      margin: 0,
                    }}>
                      {weight === 'light' ? t('settings.light') : weight === 'bold' ? t('settings.bold') : t('settings.regular')}
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
                        {t('common.active')}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <p style={{
              marginTop: '10px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 400,
              fontSize: '15px',
              letterSpacing: '0.04em',
              color: theme.textMuted,
            }}>
              {t('settings.thicknessSaved')}
            </p>
          </div>

          {/* Text size */}
          <div>
            <p style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Jost', sans-serif",
              fontSize: '14px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: theme.textMuted,
              margin: '0 0 12px 0',
            }}>
              <Type style={{ width: '13px', height: '13px' }} strokeWidth={1.4} />
              {t('settings.textSize')}
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
                    fontSize: '15px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t(s.value === 'sm' ? 'settings.compact' : s.value === 'lg' ? 'settings.large' : 'settings.standard')}
                </button>
              ))}
            </div>
            <p style={{
              marginTop: '10px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 400,
              fontSize: '15px',
              letterSpacing: '0.04em',
              color: theme.textMuted,
            }}>
              {t('settings.textSizeHelp')}
            </p>
          </div>
        </div>
      </Section>

      {/* ── Security ── */}
      <Section>
        <SectionHeader title={t('settings.security')} description={t('settings.securityHelp')} />
        <form onSubmit={handlePasswordChange} className="space-y-5 px-7 py-7">
          <div className="space-y-2">
            <Label htmlFor="new_password">{t('settings.newPassword')}</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">{t('settings.confirmPassword')}</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder={t('settings.reenter')}
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
                fontSize: '14px',
                fontWeight: 400,
              }}
            >
              {pwStatus === 'success' && <Check style={{ width: '14px', height: '14px' }} strokeWidth={1.6} />}
              {translateKnownError(pwMessage, t)}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button type="submit" disabled={pwStatus === 'saving'} className="w-full sm:w-auto">
              <KeyRound />
              {pwStatus === 'saving' ? t('settings.updating') : t('settings.updatePassword')}
            </Button>
          </div>
        </form>
      </Section>

      {/* ── Billing ── */}
      <Section>
        <SectionHeader title={t('settings.billing')} description={t('settings.billingHelp')} />
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
                  fontSize: '14px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: theme.textMuted,
                  margin: 0,
                }}>
                  {t('settings.currentPlan')}
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
                    fontSize: '14px',
                    fontWeight: 400,
                    color: theme.textMuted,
                    marginLeft: '10px',
                  }}>
                    {planInfo.price}
                  </span>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {activeMember && (
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
                    fontSize: '14px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: portalLoading ? 'not-allowed' : 'pointer',
                    opacity: portalLoading ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CreditCard style={{ width: '12px', height: '12px' }} strokeWidth={1.4} />
                  {portalLoading ? t('settings.opening') : t('settings.manageBilling')}
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
                  fontSize: '14px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: `0 4px 14px ${theme.accent}33`,
                }}
              >
                <Crown style={{ width: '12px', height: '12px' }} strokeWidth={1.8} />
                {activeMember ? t('settings.manageMembership') : t('trial.become')}
              </Link>
            </div>
          </div>

          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 400,
            fontSize: '15px',
            letterSpacing: '0.04em',
            color: theme.textMuted,
            margin: 0,
          }}>
            {activeMember ? t('settings.memberBillingHelp') : t('settings.freeBillingHelp')}
          </p>
        </div>
      </Section>
    </div>
  )
}
