'use client'

import { useLocale } from '@/lib/locale-context'
import { translateKnownError } from '@/lib/i18n/translate'

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
  const { t } = useLocale()
  return (
    <>
      {error && (
        <div style={{ marginBottom: '16px', borderRadius: '1px', border: '1px solid rgba(183,110,121,0.3)', background: 'rgba(183,110,121,0.08)', padding: '12px 16px' }}>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '12px', fontWeight: 300, color: '#D4959E', margin: 0 }}>
            {translateKnownError(decodeURIComponent(error), t)}
          </p>
        </div>
      )}

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="full_name" style={labelStyle}>{t('auth.fullName')}</label>
          <input id="full_name" name="full_name" type="text" placeholder={t('auth.fullNamePlaceholder')} autoComplete="name" required className="auth-input" />
        </div>

        <div>
          <label htmlFor="email" style={labelStyle}>{t('auth.email')}</label>
          <input id="email" name="email" type="email" placeholder={t('auth.emailPlaceholder')} autoComplete="email" required className="auth-input" />
        </div>

        <div>
          <label htmlFor="password" style={labelStyle}>{t('auth.password')}</label>
          <input id="password" name="password" type="password" placeholder={t('auth.passwordPlaceholder')} autoComplete="new-password" minLength={8} required className="auth-input" />
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
          {t('auth.createAccount')}
        </button>
      </form>

      <p style={{ marginTop: '24px', textAlign: 'center', fontFamily: "'Jost', sans-serif", fontSize: '10px', fontWeight: 300, lineHeight: 1.6, letterSpacing: '0.04em', color: '#6B6B65' }}>
        {t('auth.agree')}{' '}
        <a href="/terms" style={{ color: 'rgba(201,168,76,0.8)', textDecoration: 'none' }}>{t('auth.terms')}</a>
        {' '}{t('auth.and')}{' '}
        <a href="/privacy" style={{ color: 'rgba(201,168,76,0.8)', textDecoration: 'none' }}>{t('auth.privacy')}</a>
      </p>
    </>
  )
}
