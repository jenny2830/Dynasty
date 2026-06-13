'use client'

const labelStyle: React.CSSProperties = {
  color: '#8A8A82',
  fontFamily: "'Jost', sans-serif",
  fontSize: '10px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginBottom: '7px',
  display: 'block',
}

interface SignupFormProps {
  action: (formData: FormData) => Promise<void>
  error?: string
}

export function SignupForm({ action, error }: SignupFormProps) {
  return (
    <>
      {error && (
        <div style={{ marginBottom: '16px', borderRadius: '1px', border: '1px solid rgba(183,110,121,0.3)', background: 'rgba(183,110,121,0.08)', padding: '12px 16px' }}>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', fontWeight: 300, color: '#D4959E', margin: 0 }}>
            {decodeURIComponent(error)}
          </p>
        </div>
      )}

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="full_name" style={labelStyle}>Full Name</label>
          <input id="full_name" name="full_name" type="text" placeholder="Jane Smith" autoComplete="name" required className="auth-input" />
        </div>

        <div>
          <label htmlFor="email" style={labelStyle}>Email Address</label>
          <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required className="auth-input" />
        </div>

        <div>
          <label htmlFor="password" style={labelStyle}>Password</label>
          <input id="password" name="password" type="password" placeholder="Minimum 8 characters" autoComplete="new-password" minLength={8} required className="auth-input" />
        </div>

        <button
          type="submit"
          style={{
            marginTop: '4px',
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #C9A84C, #9A7A2E)',
            color: '#080808',
            fontFamily: "'Jost', sans-serif",
            fontWeight: 600,
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            border: 'none',
            borderRadius: '1px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
          }}
        >
          Create Account
        </button>
      </form>

      <p style={{ marginTop: '24px', textAlign: 'center', fontFamily: "'Jost', sans-serif", fontSize: '10px', fontWeight: 300, lineHeight: 1.6, letterSpacing: '0.04em', color: '#6B6B65' }}>
        By signing up you agree to our{' '}
        <a href="/terms" style={{ color: 'rgba(201,168,76,0.8)', textDecoration: 'none' }}>Terms</a>
        {' '}and{' '}
        <a href="/privacy" style={{ color: 'rgba(201,168,76,0.8)', textDecoration: 'none' }}>Privacy Policy</a>
      </p>
    </>
  )
}
