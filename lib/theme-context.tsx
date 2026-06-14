'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeId, ThemeColors, THEMES, toThemeId } from './themes'
import { createClient } from '@/lib/supabase/client'

export type TextThickness = 'light' | 'regular' | 'bold'

const FONT_WEIGHT_MAP: Record<TextThickness, {
  thin: number; body: number; medium: number; semibold: number; bold: number
}> = {
  light:   { thin: 300, body: 400, medium: 400, semibold: 500, bold: 600 },
  regular: { thin: 400, body: 500, medium: 600, semibold: 700, bold: 800 },
  bold:    { thin: 500, body: 700, medium: 800, semibold: 900, bold: 900 },
}

interface ThemeContextValue {
  themeId: ThemeId
  theme: ThemeColors
  setThemeId: (id: ThemeId) => void
  textThickness: TextThickness
  setTextThickness: (t: TextThickness) => void
  fontWeights: { thin: number; body: number; medium: number; semibold: number; bold: number }
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'light-gold',
  theme: THEMES['light-gold'],
  setThemeId: () => {},
  textThickness: 'light',
  setTextThickness: () => {},
  fontWeights: FONT_WEIGHT_MAP.light,
  mounted: false,
})

export function useAppTheme() {
  return useContext(ThemeContext)
}

interface AppThemeProviderProps {
  children: ReactNode
  initialThemeId?: ThemeId
}

// Read the theme from localStorage SYNCHRONOUSLY before the first render so the
// user's saved choice persists across refreshes with no flash/reset. The
// server-provided value is only a fallback for first load on a fresh device
// (no localStorage yet); after that, localStorage is authoritative.
function getInitialTheme(initialThemeId?: ThemeId): ThemeId {
  // When the server provides a theme preference, keep it authoritative on both
  // SSR and the first client render to avoid hydration mismatches.
  if (initialThemeId && THEMES[initialThemeId]) {
    return initialThemeId
  }

  if (typeof window === 'undefined') {
    return 'light-gold'
  }
  try {
    const saved = localStorage.getItem('dynasty-theme') as ThemeId | null
    if (saved && THEMES[saved]) return saved
  } catch {}
  return 'light-gold'
}

function getInitialTextThickness(): TextThickness {
  if (typeof window === 'undefined') return 'light'
  try {
    const saved = localStorage.getItem('dynasty-text-thickness') as TextThickness | null
    if (saved === 'light' || saved === 'regular' || saved === 'bold') return saved
  } catch {}
  return 'light'
}

export function AppThemeProvider({ children, initialThemeId }: AppThemeProviderProps) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => getInitialTheme(initialThemeId))
  const [textThickness, setTextThicknessState] = useState<TextThickness>(getInitialTextThickness)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  // After hydration, localStorage becomes authoritative for this browser.
  // This preserves the user's saved choice without risking SSR mismatch.
  useEffect(() => {
    if (!mounted) return
    try {
      const saved = localStorage.getItem('dynasty-theme') as ThemeId | null
      if (saved && THEMES[saved] && saved !== themeId) {
        setThemeIdState(saved)
      }
    } catch {}
  }, [mounted, themeId])

  // After mount, sync with Supabase in case the user changed the theme on
  // another device. Only override when the DB value actually differs from what
  // localStorage already applied — this avoids snapping back to a stale value.
  useEffect(() => {
    const syncFromSupabase = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase
          .from('landlords')
          .select('theme_preference, text_thickness')
          .eq('auth_user_id', user.id)
          .maybeSingle() as any) as { data: { theme_preference?: string; text_thickness?: string } | null }

        if (data?.theme_preference && THEMES[data.theme_preference as ThemeId]) {
          const localTheme = localStorage.getItem('dynasty-theme')
          if (data.theme_preference !== localTheme) {
            setThemeIdState(data.theme_preference as ThemeId)
            localStorage.setItem('dynasty-theme', data.theme_preference)
          }
        }

        if (
          data?.text_thickness === 'light' ||
          data?.text_thickness === 'regular' ||
          data?.text_thickness === 'bold'
        ) {
          const localThickness = localStorage.getItem('dynasty-text-thickness')
          if (data.text_thickness !== localThickness) {
            setTextThicknessState(data.text_thickness)
            localStorage.setItem('dynasty-text-thickness', data.text_thickness)
          }
        }
      } catch (err) {
        console.error('Theme sync error:', err)
      }
    }
    syncFromSupabase()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setThemeId = async (id: ThemeId) => {
    setThemeIdState(id)
    // Persist locally for instant load on next visit
    if (typeof window !== 'undefined') {
      localStorage.setItem('dynasty-theme', id)
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('landlords')
        .update({ theme_preference: id })
        .eq('auth_user_id', user.id)
    }
  }

  const setTextThickness = async (t: TextThickness) => {
    setTextThicknessState(t)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dynasty-text-thickness', t)
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('landlords') as any)
        .update({ text_thickness: t })
        .eq('auth_user_id', user.id)
    }
  }

  const fontWeights = FONT_WEIGHT_MAP[textThickness]

  return (
    <ThemeContext.Provider value={{
      themeId,
      theme: THEMES[themeId],
      setThemeId,
      textThickness,
      setTextThickness,
      fontWeights,
      mounted,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}
