'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeId, ThemeColors, THEMES, toThemeId } from './themes'
import { createClient } from '@/lib/supabase/client'

interface ThemeContextValue {
  themeId: ThemeId
  theme: ThemeColors
  setThemeId: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'dark-gold',
  theme: THEMES['dark-gold'],
  setThemeId: () => {},
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
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('landlords')
          .select('theme_preference')
          .eq('auth_user_id', user.id)
          .maybeSingle()
        if (data?.theme_preference) {
          setThemeIdState(toThemeId(data.theme_preference))
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

  return (
    <ThemeContext.Provider value={{ themeId, theme: THEMES[themeId], setThemeId }}>
      {children}
    </ThemeContext.Provider>
  )
}
