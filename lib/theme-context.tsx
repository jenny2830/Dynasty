'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeId, ThemeColors, THEMES, toThemeId } from './themes'
import { createClient } from '@/lib/supabase/client'

export type TextThickness = 'light' | 'regular' | 'bold'

const FONT_WEIGHT_MAP: Record<TextThickness, {
  thin: number; body: number; medium: number; semibold: number; bold: number
}> = {
  light:   { thin: 200, body: 300, medium: 300, semibold: 400, bold: 500 },
  regular: { thin: 300, body: 400, medium: 500, semibold: 600, bold: 700 },
  bold:    { thin: 400, body: 600, medium: 700, semibold: 800, bold: 900 },
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
  fontWeights: FONT_WEIGHT_MAP.light,
})

export function useAppTheme() {
  return useContext(ThemeContext)
}

interface AppThemeProviderProps {
  children: ReactNode
  initialThemeId?: ThemeId
}

export function AppThemeProvider({ children, initialThemeId }: AppThemeProviderProps) {
  const [themeId, setThemeIdState] = useState<ThemeId>(initialThemeId ?? 'dark-gold')
  const [textThickness, setTextThicknessState] = useState<TextThickness>('light')
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
        }
        if (data?.text_thickness === 'light' || data?.text_thickness === 'regular' || data?.text_thickness === 'bold') {
          setTextThicknessState(data.text_thickness)
        }
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setThemeId = async (id: ThemeId) => {
    setThemeIdState(id)
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
