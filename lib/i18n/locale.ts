import type { Locale } from './types'

export type { Locale }

export const LOCALE_COOKIE = 'dynasty-locale'
export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365

export function parseLocale(value: string | null | undefined): Locale | null {
  if (value === 'en' || value === 'es') return value
  return null
}

/**
 * Pick English or Spanish from an Accept-Language header.
 * Spanish (including es-CO and other regional tags) wins when it is the
 * highest-priority language we support. Anything else defaults to English.
 */
export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return 'en'

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tagRaw, ...params] = part.trim().split(';')
      const qParam = params.find((param) => param.trim().toLowerCase().startsWith('q='))
      const quality = qParam ? Number.parseFloat(qParam.split('=')[1] ?? '') : 1
      return {
        tag: tagRaw.trim().toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
      }
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.quality - a.quality)

  for (const { tag } of ranked) {
    if (tag.startsWith('es')) return 'es'
    if (tag.startsWith('en')) return 'en'
  }

  return 'en'
}

export function localeCookieHeader(locale: Locale): string {
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_MAX_AGE}; SameSite=Lax`
}

export function intlTag(locale: Locale): string {
  return locale === 'es' ? 'es-CO' : 'en-CA'
}
