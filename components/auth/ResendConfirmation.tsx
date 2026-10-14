'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const COOLDOWN_SECONDS = 60

const labelStyle: React.CSSProperties = {
  color: '#8A8A82',
  fontFamily: "'Jost', sans-serif",
  fontSize: '10px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginBottom: '7px',
  display: 'block',
  textAlign: 'left',
}

interface ResendConfirmationProps {
  /** When provided, the address is fixed and no email input is shown. */
  email?: string
  /** Start with the cooldown active (e.g. an email was just sent). */
  startWithCooldown?: boolean
}

export function ResendConfirmation({ email: fixedEmail, startWithCooldown = false }: ResendConfirmationProps) {
  const [email, setEmail] = useState(fixedEmail ?? '')
  const [cooldown, setCooldown] = useState(startWithCooldown ? COOLDOWN_SECONDS : 0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (cooldown > 0 || !email) return
    setStatus('loading')
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email })

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('sent')
      setMessage(`A new confirmation email is on its way to ${email}.`)
      setCooldown(COOLDOWN_SECONDS)
    }
  }

  const disabled = status === 'loading' || cooldown > 0 || !email
  const buttonLabel =
    status === 'loading'
      ? 'Sending…'
      : cooldown > 0
        ? `Resend available in ${cooldown}s`
        : 'Resend confirmation email'

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {!fixedEmail && (
        <div>
          <label htmlFor="resend-email" style={labelStyle}>Email Address</label>
          <input
            id="resend-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="auth-input"
          />
        </div>
      )}

      {message && (
        <div style={{
          borderRadius: '1px',
          border: status === 'error' ? '1px solid rgba(183,110,121,0.3)' : '1px solid rgba(201,168,76,0.3)',
          background: status === 'error' ? 'rgba(183,110,121,0.08)' : 'rgba(201,168,76,0.08)',
          padding: '12px 16px',
        }}>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', fontWeight: 300, color: status === 'error' ? '#D4959E' : '#C9A84C', margin: 0, textAlign: 'left' }}>
            {message}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={disabled}
        style={{
          width: '100%',
          padding: '14px',
          background: 'transparent',
          border: '1px solid rgba(201,168,76,0.3)',
          color: disabled ? 'rgba(201,168,76,0.45)' : '#C9A84C',
          fontFamily: "'Jost', sans-serif",
          fontWeight: 400,
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          borderRadius: '1px',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {buttonLabel}
      </button>
    </form>
  )
}
