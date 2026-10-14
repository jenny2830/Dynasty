'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ResendConfirmation } from '@/components/auth/ResendConfirmation'
import { confirmToken, type ConfirmState } from './actions'
import { FORGOT_PASSWORD_PATH } from './shared'

interface ConfirmFormProps {
  tokenHash: string
  type: string
  next: string
  isRecovery: boolean
  initialError: string | null
}

const headingStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: '26px',
  fontWeight: 500,
  letterSpacing: '0.04em',
  color: '#FAF7F2',
  margin: 0,
}

const subheadingStyle: React.CSSProperties = {
  marginTop: '6px',
  fontFamily: "'Jost', sans-serif",
  fontSize: '11px',
  fontWeight: 300,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: '#6B6B65',
}

const bodyStyle: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  fontSize: '13px',
  fontWeight: 300,
  lineHeight: 1.6,
  color: '#8A8A82',
  margin: 0,
}

const primaryLinkStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)',
  color: '#080808',
  fontFamily: "'Jost', sans-serif",
  fontWeight: 600,
  fontSize: '11px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  textAlign: 'center',
  textDecoration: 'none',
  borderRadius: '1px',
  boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
  boxSizing: 'border-box',
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: '1px', border: '1px solid rgba(183,110,121,0.3)', background: 'rgba(183,110,121,0.08)', padding: '12px 16px' }}>
      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', fontWeight: 300, color: '#D4959E', margin: 0, textAlign: 'left' }}>
        {children}
      </p>
    </div>
  )
}

function Divider() {
  return <div style={{ margin: '16px auto 0', height: '1px', width: '40px', background: 'rgba(201,168,76,0.5)' }} />
}

export function ConfirmForm({ tokenHash, type, next, isRecovery, initialError }: ConfirmFormProps) {
  const [state, formAction, pending] = useActionState<ConfirmState, FormData>(confirmToken, { error: initialError })

  if (state.error) {
    if (isRecovery) {
      return (
        <div style={{ textAlign: 'center' }}>
          <h1 style={headingStyle}>Reset your password</h1>
          <p style={subheadingStyle}>Link unavailable</p>
          <Divider />
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ErrorBox>This reset link has expired or was already used.</ErrorBox>
            <p style={bodyStyle}>Request a new link and we&apos;ll email it to you right away.</p>
            <Link href={FORGOT_PASSWORD_PATH} style={primaryLinkStyle}>
              Request a new reset link
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div style={{ textAlign: 'center' }}>
        <h1 style={headingStyle}>Confirm your email</h1>
        <p style={subheadingStyle}>Link unavailable</p>
        <Divider />
        <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ErrorBox>
            This confirmation link has expired or was already used. If you already confirmed your account, you can sign in.
            Otherwise, enter your email below and we&apos;ll send a new link.
          </ErrorBox>
          <ResendConfirmation />
          <Link
            href="/login"
            style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#C9A84C', textDecoration: 'none' }}
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={headingStyle}>{isRecovery ? 'Reset your password' : 'Confirm your email'}</h1>
      <p style={subheadingStyle}>{isRecovery ? 'One more step' : 'Almost there'}</p>
      <Divider />
      <p style={{ ...bodyStyle, marginTop: '28px' }}>
        {isRecovery
          ? 'Continue to choose a new password for your Dynasty account.'
          : 'Click below to activate your Dynasty account and begin.'}
      </p>

      <form action={formAction} style={{ marginTop: '28px' }}>
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          disabled={pending}
          style={{
            width: '100%',
            padding: '14px',
            background: pending ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #C9A84C, #9A7A2E)',
            color: '#080808',
            fontFamily: "'Jost', sans-serif",
            fontWeight: 600,
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            border: 'none',
            borderRadius: '1px',
            cursor: pending ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
          }}
        >
          {pending ? 'Verifying…' : isRecovery ? 'Continue to reset password' : 'Confirm my account'}
        </button>
      </form>
    </div>
  )
}
