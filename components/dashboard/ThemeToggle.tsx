'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const cycle = () => {
    if (resolvedTheme === 'dark') setTheme('light')
    else if (resolvedTheme === 'light') setTheme('rose')
    else setTheme('dark')
  }

  const label =
    resolvedTheme === 'dark'
      ? 'Light Mode'
      : resolvedTheme === 'light'
      ? 'Rose Mode'
      : 'Dark Mode'

  const Icon =
    resolvedTheme === 'dark'
      ? Sun
      : resolvedTheme === 'light'
      ? Sparkles
      : Moon

  return (
    <button
      onClick={cycle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '11px 20px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--sidebar-muted-color)',
        fontFamily: "'Jost', sans-serif",
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--sidebar-hover-color)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--sidebar-muted-color)')}
    >
      <Icon size={15} strokeWidth={1.2} />
      <span>{label}</span>
    </button>
  )
}
