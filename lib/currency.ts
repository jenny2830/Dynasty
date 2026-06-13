import { COUNTRIES } from '@/lib/geo'

/** Approximate conversion rates from CAD base. */
export const CURRENCY_RATES: Record<string, number> = {
  CAD: 1,
  USD: 0.74,
  COP: 3050,
  GBP: 0.58,
  AUD: 1.13,
  MXN: 12.8,
}

export const DISPLAY_CURRENCIES = COUNTRIES.map((c) => c.currency)

export function convertAmount(amountCAD: number, targetCurrency: string): number {
  return amountCAD * (CURRENCY_RATES[targetCurrency] ?? 1)
}
