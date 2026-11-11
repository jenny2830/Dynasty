'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { LOCALE_COOKIE, localeCookieHeader, type Locale } from '@/lib/i18n/locale'
import { createTranslator, type TFunction } from '@/lib/i18n/translate'
import { formatCurrency, formatDate, formatNumber, formatPropertyCurrency } from '@/lib/utils'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TFunction
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: ReactNode
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((next: Locale) => {
    if (next !== 'en' && next !== 'es') return
    document.cookie = localeCookieHeader(next)
    try {
      localStorage.setItem(LOCALE_COOKIE, next)
    } catch {
      // Private mode can block storage; the cookie still persists the choice.
    }
    document.documentElement.lang = next
    setLocaleState(next)
    router.refresh()
  }, [router])

  const t = useMemo(() => createTranslator(locale), [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext)
  if (!value) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return value
}

export function useFormatters() {
  const { locale } = useLocale()
  return {
    locale,
    money: (amount: number | null | undefined, currency = 'CAD', decimals = 2) =>
      formatCurrency(amount, currency, decimals, locale),
    propertyMoney: (amount: number | null | undefined, currency = 'CAD') =>
      formatPropertyCurrency(amount, currency, locale),
    date: (value: string | Date) => formatDate(value, locale),
    number: (value: number | null | undefined, decimals = 0) => formatNumber(value, decimals, locale),
  }
}
