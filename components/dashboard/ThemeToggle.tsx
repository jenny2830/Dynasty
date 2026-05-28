'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  const isDark = theme === 'dark'
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '11px 20px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#4A4A45',
        fontFamily: 'Jost, sans-serif',
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}
    >
      {isDark
        ? <Sun size={15} strokeWidth={1.2} />
        : <Moon size={15} strokeWidth={1.2} />
      }
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  )
}
