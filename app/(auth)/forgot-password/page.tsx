'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#2A2A2A',
  border: '1px solid rgba(201,168,76,0.12)',
  borderRadius: '1px',
  color: '#D4D4CC',
  padding: '12px 16px',
  fontSize: '13px',
  fontFamily: "'Jost', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  color: '#8A8A82',
  fontFamily: "'Jost', sans-serif",
  fontSize: '10px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginBottom: '7px',
  display: 'block',
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#080808',
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #1C1A17 0%, #080808 70%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
    }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, #C9A84C 50%, transparent 100%)' }} aria-hidden />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/dynastynobg.png" alt="Dynasty" style={{ width: '200px', height: 'auto', objectFit: 'contain' }} />
        </div>

        <div style={{
          background: 'rgba(17,17,17,0.97)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '2px',
          padding: '48px 44px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '18px', height: '18px', borderTop: '1px solid rgba(201,168,76,0.35)', borderLeft: '1px solid rgba(201,168,76,0.35)' }} />
          <div style={{ position: 'absolute', top: '10px', right: '10px', width: '18px', height: '18px', borderTop: '1px solid rgba(201,168,76,0.35)', borderRight: '1px solid rgba(201,168,76,0.35)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '18px', height: '18px', borderBottom: '1px solid rgba(201,168,76,0.35)', borderLeft: '1px solid rgba(201,168,76,0.35)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '18px', height: '18px', borderBottom: '1px solid rgba(201,168,76,0.35)', borderRight: '1px solid rgba(201,168,76,0.35)' }} />

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 500, letterSpacing: '0.04em', color: '#FAF7F2', margin: 0 }}>
              Reset Password
            </h1>
            <p style={{ marginTop: '6px', fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#6B6B65' }}>
              We&apos;ll send you a reset link
            </p>
          </div>

          {status === 'sent' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', color: '#C9A84C', marginBottom: '16px' }}>◆</div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '14px', color: '#FAF7F2', marginBottom: '8px' }}>
                Check your inbox
              </p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', color: '#8A8A82', marginBottom: '24px', lineHeight: 1.6 }}>
                If an account exists for <strong style={{ color: '#C9A84C' }}>{email}</strong>, you&apos;ll receive a password reset link shortly.
              </p>
              <Link
                href="/login"
                style={{ fontFamily: "'Jost', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#C9A84C', textDecoration: 'none' }}
              >
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {status === 'error' && message && (
                <div style={{ marginBottom: '20px', borderRadius: '1px', border: '1px solid rgba(183,110,121,0.3)', background: 'rgba(183,110,121,0.08)', padding: '12px 16px' }}>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', fontWeight: 300, color: '#D4959E', margin: 0 }}>
                    {message}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label htmlFor="email" style={labelStyle}>Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.06)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: status === 'loading' ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #C9A84C, #9A7A2E)',
                    color: '#080808',
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: 600,
                    fontSize: '11px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '1px',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
                  }}
                >
                  {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ marginTop: '28px', textAlign: 'center', fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 300, letterSpacing: '0.08em', color: '#6B6B65' }}>
          <Link href="/login" style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#C9A84C', textDecoration: 'none' }}>
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
