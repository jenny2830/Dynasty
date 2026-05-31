'use client'

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

function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.06)'
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.12)'
  e.currentTarget.style.boxShadow = 'none'
}

interface LoginFormProps {
  action: (formData: FormData) => Promise<void>
  error?: string
  next?: string
}

export function LoginForm({ action, error, next }: LoginFormProps) {
  return (
    <>
      {error && (
        <div style={{ marginBottom: '20px', borderRadius: '1px', border: '1px solid rgba(183,110,121,0.3)', background: 'rgba(183,110,121,0.08)', padding: '12px 16px' }}>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', fontWeight: 300, color: '#D4959E', margin: 0 }}>
            {decodeURIComponent(error)}
          </p>
        </div>
      )}

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {next && <input type="hidden" name="next" value={next} />}

        <div>
          <label htmlFor="email" style={labelStyle}>Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
            <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
            <a
              href="/forgot-password"
              style={{ fontFamily: "'Jost', sans-serif", fontSize: '10px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(201,168,76,0.7)', textDecoration: 'none' }}
            >
              Forgot?
            </a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
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
          Sign In
        </button>
      </form>
    </>
  )
}
