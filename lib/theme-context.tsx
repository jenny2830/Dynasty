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
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'dark-gold',
  theme: THEMES['dark-gold'],
  setThemeId: () => {},
  textThickness: 'light',
  setTextThickness: () => {},
  fontWeights: FONT_WEIGHT_MAP.light,  // updated with new scale
})

export function useAppTheme() {
  return useContext(ThemeContext)
}

interface AppThemeProviderProps {
  children: ReactNode
  initialThemeId?: ThemeId
}

export function AppThemeProvider({ children, initialThemeId }: AppThemeProviderProps) {
  // Read from localStorage first (instant on refresh), fall back to server-provided value
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dynasty-theme') as ThemeId
      if (saved && THEMES[saved]) return saved
    }
    return initialThemeId ?? 'dark-gold'
  })
  const [textThickness, setTextThicknessState] = useState<TextThickness>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dynasty-text-thickness') as TextThickness
      if (saved === 'light' || saved === 'regular' || saved === 'bold') return saved
    }
    return 'light'
  })
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase
          .from('landlords')
          .select('theme_preference, text_thickness')
          .eq('auth_user_id', user.id)
          .maybeSingle() as any) as { data: { theme_preference?: string; text_thickness?: string } | null }
        if (data?.theme_preference && THEMES[data.theme_preference as ThemeId]) {
          setThemeIdState(data.theme_preference as ThemeId)
          localStorage.setItem('dynasty-theme', data.theme_preference)
        }
        if (data?.text_thickness === 'light' || data?.text_thickness === 'regular' || data?.text_thickness === 'bold') {
          setTextThicknessState(data.text_thickness)
          localStorage.setItem('dynasty-text-thickness', data.text_thickness)
        }
      }
    }
    load()
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
    }}>
      {children}
    </ThemeContext.Provider>
  )
}
