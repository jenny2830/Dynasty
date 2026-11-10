'use client'

import { useLocale } from '@/lib/locale-context'
import type { Locale } from '@/lib/i18n/types'

interface LanguageSwitcherProps {
  /** auth: fixed over the dark gate. sidebar: inside the nav. floating: phone, top-right. */
  variant?: 'auth' | 'sidebar' | 'floating'
}

export function LanguageSwitcher({ variant = 'sidebar' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale()

  const options: { id: Locale; label: string }[] = [
    { id: 'en', label: t('lang.english') },
    { id: 'es', label: t('lang.spanish') },
  ]

  const isAuth = variant === 'auth'
  const isFloating = variant === 'floating'

  return (
    <div
      role="group"
      aria-label={t('lang.switchLabel')}
      style={
        isAuth
          ? {
              position: 'fixed',
              top: '16px',
              right: '16px',
              zIndex: 50,
              display: 'flex',
              border: '1px solid rgba(201,168,76,0.35)',
              borderRadius: '2px',
              overflow: 'hidden',
              background: 'rgba(8,8,8,0.72)',
              backdropFilter: 'blur(8px)',
            }
          : isFloating
            ? {
                position: 'fixed',
                top: '14px',
                right: '14px',
                zIndex: 100,
                display: 'flex',
                border: '1px solid var(--card-border-color, rgba(201,168,76,0.35))',
                borderRadius: '2px',
                overflow: 'hidden',
                background: 'var(--card-bg, #111)',
              }
            : {
                display: 'flex',
                margin: '0 20px 12px',
                border: '1px solid var(--card-border-color, rgba(201,168,76,0.28))',
                borderRadius: '2px',
                overflow: 'hidden',
              }
      }
    >
      {options.map((option) => {
        const selected = locale === option.id
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => setLocale(option.id)}
            style={{
              flex: 1,
              border: 'none',
              cursor: 'pointer',
              padding: isAuth || isFloating ? '8px 12px' : '8px 6px',
              minWidth: isAuth || isFloating ? '76px' : 0,
              fontFamily: "'Jost', sans-serif",
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'none',
              background: selected
                ? isAuth
                  ? 'linear-gradient(135deg, #C9A84C, #9A7A2E)'
                  : 'var(--accent-c, #C9A84C)'
                : 'transparent',
              color: selected
                ? isAuth
                  ? '#080808'
                  : 'var(--text-on-accent, #080808)'
                : isAuth
                  ? '#C9A84C'
                  : 'var(--text-muted-c, #8A8A82)',
              fontWeight: selected ? 600 : 400,
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
