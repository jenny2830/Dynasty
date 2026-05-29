'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Palette, Type, KeyRound, Check, CreditCard, Crown } from 'lucide-react'
import Link from 'next/link'
import { Section, SectionHeader } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

type TextSize = 'sm' | 'md' | 'lg'
type ColorPalette = 'black-gold' | 'rose-gold' | 'white-black'

const TEXT_SIZES: { value: TextSize; label: string; hint: string }[] = [
  { value: 'sm', label: 'Compact', hint: 'Smaller' },
  { value: 'md', label: 'Standard', hint: 'Default' },
  { value: 'lg', label: 'Large', hint: 'Bigger' },
]

const COLOR_PALETTES: {
  value: ColorPalette
  label: string
  hint: string
  swatches: string[]
} [] = [
  {
    value: 'black-gold',
    label: 'Black & Gold',
    hint: 'Default',
    swatches: ['#080808', '#C9A84C'],
  },
  {
    value: 'rose-gold',
    label: 'Rose Gold',
    hint: 'Signature',
    swatches: ['#0C0809', '#B76E79', '#D4959E'],
  },
  {
    value: 'white-black',
    label: 'White & Black',
    hint: 'Light',
    swatches: ['#FAF7F2', '#1C1A17'],
  },
]

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: '92px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '11px 14px',
        background: active ? 'rgba(201,168,76,0.10)' : 'transparent',
        border: active
          ? '1px solid rgba(201,168,76,0.45)'
          : '1px solid rgba(201,168,76,0.15)',
        borderRadius: '2px',
        color: active ? '#C9A84C' : '#9A8F7A',
        fontFamily: "'Jost', sans-serif",
        fontSize: '11px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  )
}

function PaletteButton({
  active,
  onClick,
  label,
  hint,
  swatches,
}: {
  active: boolean
  onClick: () => void
  label: string
  hint: string
  swatches: string[]
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: '110px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '9px',
        padding: '13px 14px',
        background: active ? 'rgba(201,168,76,0.08)' : 'transparent',
        border: active
          ? '1px solid rgba(201,168,76,0.45)'
          : '1px solid rgba(201,168,76,0.15)',
        borderRadius: '2px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
      }}
    >
      {/* Color swatch row */}
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {swatches.map((color, i) => (
          <div
            key={i}
            style={{
              width: '11px',
              height: '11px',
              borderRadius: '50%',
              background: color,
              border: '1px solid rgba(201,168,76,0.18)',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      {/* Labels */}
      <div>
        <div style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '10px',
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          color: active ? '#C9A84C' : '#9A8F7A',
          lineHeight: 1.2,
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.06em',
          color: active ? 'rgba(201,168,76,0.55)' : '#6B6B65',
          marginTop: '3px',
        }}>
          {hint}
        </div>
      </div>
    </button>
  )
}

const PLAN_LABELS: Record<string, { label: string; price: string }> = {
  starter:   { label: 'Starter',   price: '$29 CAD/mo' },
  landlord:  { label: 'Landlord',  price: '$79 CAD/mo' },
  portfolio: { label: 'Portfolio', price: '$149 CAD/mo' },
}

interface SettingsPanelProps {
  currentPlan?: 'starter' | 'landlord' | 'portfolio'
  hasSubscription?: boolean
}

export function SettingsPanel({ currentPlan = 'starter', hasSubscription = false }: SettingsPanelProps) {
  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [textSize, setTextSize] = useState<TextSize>('md')
  const [colorPalette, setColorPalette] = useState<ColorPalette>('black-gold')

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

    const savedPalette = localStorage.getItem('dynasty-color-palette')
    if (savedPalette === 'black-gold' || savedPalette === 'rose-gold' || savedPalette === 'white-black') {
      setColorPalette(savedPalette)
    }
  }, [])

  function applyTextSize(size: TextSize) {
    setTextSize(size)
    localStorage.setItem('dynasty-text-size', size)
    document.documentElement.dataset.textSize = size
  }

  function applyColorPalette(palette: ColorPalette) {
    setColorPalette(palette)
    localStorage.setItem('dynasty-color-palette', palette)
    document.documentElement.dataset.colorPalette = palette
    if (palette === 'white-black') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
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
        <SectionHeader title="Appearance" description="Color palette & text size" />
        <div className="space-y-8 px-7 py-7">
          {/* Color palette */}
          <div>
            <p style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Jost', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6B6B65',
              margin: '0 0 12px 0',
            }}>
              <Palette style={{ width: '13px', height: '13px' }} strokeWidth={1.4} />
              Color Theme
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {COLOR_PALETTES.map((p) => (
                <PaletteButton
                  key={p.value}
                  active={mounted && colorPalette === p.value}
                  onClick={() => applyColorPalette(p.value)}
                  label={p.label}
                  hint={p.hint}
                  swatches={p.swatches}
                />
              ))}
            </div>
            <p style={{
              marginTop: '10px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: '#6B6B65',
            }}>
              Changes the accent color and sidebar throughout the dashboard.
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
              color: '#6B6B65',
              margin: '0 0 12px 0',
            }}>
              <Type style={{ width: '13px', height: '13px' }} strokeWidth={1.4} />
              Text Size
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {TEXT_SIZES.map((s) => (
                <SegButton
                  key={s.value}
                  active={mounted && textSize === s.value}
                  onClick={() => applyTextSize(s.value)}
                >
                  {s.label}
                </SegButton>
              ))}
            </div>
            <p style={{
              marginTop: '10px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: '#6B6B65',
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
                border:
                  pwStatus === 'success'
                    ? '1px solid rgba(201,168,76,0.3)'
                    : '1px solid rgba(183,110,121,0.3)',
                background:
                  pwStatus === 'success'
                    ? 'rgba(201,168,76,0.08)'
                    : 'rgba(183,110,121,0.08)',
                color: pwStatus === 'success' ? '#C9A84C' : '#D4959E',
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
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: '2px',
            background: 'rgba(201,168,76,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Crown style={{ width: '16px', height: '16px', color: '#C9A84C' }} strokeWidth={1.4} />
              <div>
                <p style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#6B6B65',
                  margin: 0,
                }}>
                  Current Plan
                </p>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '20px',
                  fontWeight: 500,
                  color: '#FAF7F2',
                  margin: '4px 0 0 0',
                  letterSpacing: '0.02em',
                }}>
                  {planInfo.label}
                  <span style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '12px',
                    fontWeight: 300,
                    color: '#6B6B65',
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
                    border: '1px solid rgba(201,168,76,0.28)',
                    borderRadius: '1px',
                    background: 'transparent',
                    color: '#C9A84C',
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
                  background: 'linear-gradient(135deg, #C9A84C 0%, #9A7A2E 100%)',
                  color: '#080808',
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(201,168,76,0.20)',
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
            color: '#6B6B65',
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
