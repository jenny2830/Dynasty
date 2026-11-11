export const LOCALES = ['en', 'es'] as const

export type Locale = (typeof LOCALES)[number]

export type Vars = Record<string, string | number>
