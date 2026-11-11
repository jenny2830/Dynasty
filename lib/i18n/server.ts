import { cookies } from 'next/headers'
import { LOCALE_COOKIE, parseLocale } from './locale'
import { createTranslator, type TFunction } from './translate'
import type { Locale } from './types'

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  return parseLocale(store.get(LOCALE_COOKIE)?.value) ?? 'en'
}

export async function getI18n(): Promise<{ locale: Locale; t: TFunction }> {
  const locale = await getLocale()
  return { locale, t: createTranslator(locale) }
}
