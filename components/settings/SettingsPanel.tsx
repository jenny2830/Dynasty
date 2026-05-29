'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Type, KeyRound, Check } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

type TextSize = 'sm' | 'md' | 'lg'

const TEXT_SIZES: { value: TextSize; label: string; hint: string }[] = [
  { value: 'sm', label: 'Compact', hint: 'Smaller' },
  { value: 'md', label: 'Standard', hint: 'Default' },
  { value: 'lg', label: 'Large', hint: 'Bigger' },
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

export function SettingsPanel() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [textSize, setTextSize] = useState<TextSize>('md')

  // Password form state
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [pwMessage, setPwMessage] = useState('')

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('dynasty-text-size')
    if (saved === 'sm' || saved === 'md' || saved === 'lg') {
      setTextSize(saved)
    }
  }, [])

  function applyTextSize(size: TextSize) {
    setTextSize(size)
    localStorage.setItem('dynasty-text-size', size)
    document.documentElement.dataset.textSize = size
  }

  const isDark = mounted ? resolvedTheme !== 'light' : true

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

  return (
    <div className="space-y-6">
      {/* ── Appearance ── */}
      <Section>
        <SectionHeader title="Appearance" description="Theme & text size" />
        <div className="space-y-8 px-7 py-7">
          {/* Theme */}
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
              <Sun style={{ width: '13px', height: '13px' }} strokeWidth={1.4} />
              Color Theme
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <SegButton active={mounted && isDark} onClick={() => setTheme('dark')}>
                <Moon style={{ width: '14px', height: '14px' }} strokeWidth={1.4} />
                Dark
              </SegButton>
              <SegButton active={mounted && !isDark} onClick={() => setTheme('light')}>
                <Sun style={{ width: '14px', height: '14px' }} strokeWidth={1.4} />
                Light
              </SegButton>
            </div>
            <p style={{
              marginTop: '10px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: '11px',
              letterSpacing: '0.04em',
              color: '#6B6B65',
            }}>
              Light mode inverts the dashboard surfaces to a warm ivory palette.
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
    </div>
  )
}
