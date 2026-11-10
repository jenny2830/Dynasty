import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { intlTag } from '@/lib/i18n/locale'
import type { Locale } from '@/lib/i18n/types'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format a dollar amount with comma separators and currency symbol.
 * Handles null/undefined gracefully.
 * formatCurrency(12345.67) → "$12,345.67"
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency = 'CAD',
  decimals = 2,
  locale: Locale = 'en',
): string {
  if (amount == null) return new Intl.NumberFormat(intlTag(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(0)
  return new Intl.NumberFormat(intlTag(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/** Format an amount using a property's stored currency. */
export function formatPropertyCurrency(
  amount: number | null | undefined,
  currency = 'CAD',
  locale: Locale = 'en',
): string {
  return formatCurrency(amount, currency, 2, locale)
}

/**
 * Format a plain number with comma separators.
 * formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 0,
  locale: Locale = 'en',
): string {
  if (value == null) return '0'
  return new Intl.NumberFormat(intlTag(locale), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatDate(date: string | Date, locale: Locale = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(intlTag(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

/**
 * Format a percentage value.
 * formatPercent(4.2) → "4.2%"
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '0%'
  return `${(value).toFixed(decimals)}%`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}
