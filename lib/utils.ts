import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
): string {
  if (amount == null) return '$0.00'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/**
 * Format a plain number with comma separators.
 * formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 0,
): string {
  if (value == null) return '0'
  return new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-CA', {
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
