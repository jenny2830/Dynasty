'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase exchanges the token from the URL hash automatically on load
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    if (password.length < 8) {
      setStatus('error')
      setMessage('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setStatus('error')
      setMessage('Passwords do not match.')
      return
    }

    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('success')
      setTimeout(() => router.push('/'), 2000)
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
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
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
              New Password
            </h1>
            <p style={{ marginTop: '6px', fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#6B6B65' }}>
              Choose a strong password
            </p>
          </div>

          {status === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', color: '#C9A84C', marginBottom: '16px' }}>◆</div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '14px', color: '#FAF7F2', marginBottom: '8px' }}>
                Password updated
              </p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', color: '#8A8A82' }}>
                Redirecting you to the dashboard…
              </p>
            </div>
          ) : (
            <>
              {!ready && (
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', color: '#8A8A82', textAlign: 'center', marginBottom: '20px' }}>
                  Verifying reset link…
                </p>
              )}
              {message && (
                <div style={{ marginBottom: '20px', borderRadius: '1px', border: '1px solid rgba(183,110,121,0.3)', background: 'rgba(183,110,121,0.08)', padding: '12px 16px' }}>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', fontWeight: 300, color: '#D4959E', margin: 0 }}>
                    {message}
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label htmlFor="password" style={labelStyle}>New Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    required
                    disabled={!ready}
                    style={{ ...inputStyle, opacity: ready ? 1 : 0.5 }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.06)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>
                <div>
                  <label htmlFor="confirm" style={labelStyle}>Confirm Password</label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    disabled={!ready}
                    style={{ ...inputStyle, opacity: ready ? 1 : 0.5 }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.06)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading' || !ready}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: (!ready || status === 'loading') ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #C9A84C, #9A7A2E)',
                    color: '#080808',
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: 600,
                    fontSize: '11px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '1px',
                    cursor: (!ready || status === 'loading') ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
                  }}
                >
                  {status === 'loading' ? 'Saving…' : 'Set New Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
