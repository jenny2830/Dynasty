'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface ThemeToggleProps {
  userId?: string
}

export function ThemeToggle({ userId }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = useCallback(async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)

    const supabase = createClient()

    let uid = userId
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser()
      uid = user?.id
    }

    if (uid) {
      await supabase
        .from('landlords')
        .update({ theme_preference: newTheme })
        .eq('auth_user_id', uid)
    }
  }, [theme, setTheme, userId])

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'flex items-center gap-3 px-5 py-[11px] uppercase text-left w-full',
        'font-sans font-light text-[11px] tracking-[0.14em]',
        'text-dynasty-gray-500 transition-colors duration-200',
        'hover:text-dynasty-gold hover:bg-[rgba(201,168,76,0.04)]'
      )}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-[15px] w-[15px] shrink-0" strokeWidth={1.2} />
      ) : (
        <Moon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.2} />
      )}
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  )
}
