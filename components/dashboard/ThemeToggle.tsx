'use client'
import { useTheme } from 'next-themes'
import { Moon, Sun, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const THEMES = ['dark', 'light', 'rose'] as const
type Theme = typeof THEMES[number]

const THEME_CONFIG: Record<Theme, { icon: React.ElementType; label: string }> = {
  dark:  { icon: Moon,     label: 'Dark' },
  light: { icon: Sun,      label: 'Light' },
  rose:  { icon: Sparkles, label: 'Rose Gold' },
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const currentTheme = (THEMES.includes(resolvedTheme as Theme) ? resolvedTheme : 'dark') as Theme
  const currentIndex = THEMES.indexOf(currentTheme)
  const nextTheme = THEMES[(currentIndex + 1) % THEMES.length]

  const { icon: Icon, label } = THEME_CONFIG[currentTheme]

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '11px 20px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--sidebar-muted-color, #9A8F7A)',
        fontFamily: "'Jost', sans-serif",
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--sidebar-hover-color, #C9A84C)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--sidebar-muted-color, #9A8F7A)')}
    >
      <Icon size={15} strokeWidth={1.2} />
      <span>{label}</span>
    </button>
  )
}
