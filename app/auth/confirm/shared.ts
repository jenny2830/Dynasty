export const POST_CONFIRM_PATH = '/overview'
export const RESET_PASSWORD_PATH = '/auth/reset-password'
export const FORGOT_PASSWORD_PATH = '/forgot-password'

const CONFIRM_TYPES = ['email', 'signup', 'recovery'] as const
export type ConfirmType = (typeof CONFIRM_TYPES)[number]

export function isConfirmType(value: unknown): value is ConfirmType {
  return typeof value === 'string' && (CONFIRM_TYPES as readonly string[]).includes(value)
}

export function defaultNextFor(type: ConfirmType): string {
  return type === 'recovery' ? RESET_PASSWORD_PATH : POST_CONFIRM_PATH
}

/** Only same-origin relative paths ("/x"); rejects "//host" and "/\host" open redirects. */
export function safeNextPath(next: unknown, fallback: string): string {
  if (typeof next !== 'string') return fallback
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return fallback
  if (/[\u0000-\u001F\u007F]/.test(next)) return fallback
  return next
}
