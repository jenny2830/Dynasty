'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '11px 20px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#9A8F7A',
        fontFamily: "'Jost', sans-serif",
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
      onMouseLeave={e => (e.currentTarget.style.color = '#9A8F7A')}
    >
      {isDark ? <Sun size={15} strokeWidth={1.2} /> : <Moon size={15} strokeWidth={1.2} />}
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  )
}
