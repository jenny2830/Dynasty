import { en, type MessageKey } from './en'
import { es } from './es'
import type { Locale, Vars } from './types'

export type TFunction = (key: MessageKey, vars?: Vars) => string

const CATALOGS = { en, es } as const

export function messagesFor(locale: Locale) {
  return CATALOGS[locale]
}

export function translate(locale: Locale, key: MessageKey, vars?: Vars): string {
  const catalog = CATALOGS[locale]
  let text: string = catalog[key] ?? en[key]
  if (!vars) return text
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value))
  }
  return text
}

export function createTranslator(locale: Locale): TFunction {
  return (key, vars) => translate(locale, key, vars)
}

const EXACT_ERRORS: Record<string, MessageKey> = {
  'Not authenticated': 'errors.notAuthenticated',
  Unauthorized: 'errors.unauthorized',
  'Landlord profile not found': 'errors.profileNotFound',
  'Profile not found': 'errors.profileMissing',
  'Landlord not found': 'errors.landlordMissing',
  'Payment not found': 'errors.paymentNotFound',
  'Name is required': 'errors.nameRequired',
  'Address is required': 'errors.addressRequired',
  'City is required': 'errors.cityRequired',
  'Province is required': 'errors.provinceRequired',
  'Category is required': 'errors.categoryRequired',
  'Amount must be positive': 'errors.amountPositive',
  'Date is required': 'errors.dateRequired',
  'Property is required': 'errors.propertyRequired',
  'Due date is required': 'errors.dueDateRequired',
  'Password must be at least 8 characters.': 'errors.passwordLength',
  'Passwords do not match.': 'errors.passwordMismatch',
  'Failed to create profile. Please try again.': 'errors.profileFailed',
  'Your account has been suspended. Contact support.': 'errors.accountSuspended',
  account_suspended: 'errors.accountSuspended',
  profile_failed: 'errors.profileFailed',
  'This link is invalid or incomplete.': 'errors.invalidLink',
  'Invalid login credentials': 'errors.invalidCredentials',
  'Email not confirmed': 'errors.emailNotConfirmed',
  'User already registered': 'errors.userExists',
  'Unable to validate email address: invalid format': 'errors.invalidEmail',
  'Password should be at least 6 characters': 'errors.weakPassword',
  'Password should be at least 6 characters.': 'errors.weakPassword',
  'New password should be different from the old password.': 'errors.samePassword',
  'Auth session missing!': 'errors.sessionMissing',
  'Invalid Refresh Token: Refresh Token Not Found': 'errors.sessionMissing',
  'Something went wrong': 'errors.generic',
  'Network error — please try again': 'errors.network',
  'Checkout failed': 'errors.checkoutFailed',
  'Invalid billing interval': 'errors.invalidBilling',
  'Price not configured': 'errors.priceMissing',
  'No billing account': 'errors.noBilling',
  'Portal failed': 'errors.portalFailed',
  'Could not open billing portal': 'errors.portalFailed',
  'Invalid request': 'errors.invalidRequest',
  'Invalid JSON body': 'errors.invalidRequest',
  'Scan failed': 'errors.scanFailed',
  'Unit number is required': 'errors.unitNumberRequired',
  'Password updated successfully.': 'settings.passwordUpdated',
  'Please upload a JPEG, PNG, WebP, or GIF image.': 'receipts.badType',
  'Image must be under 10MB.': 'receipts.tooLarge',
  'Amount, date, and category are required': 'receipts.requiredFields',
  'PDF generation failed. Please try again.': 'reports.pdfFailed',
}

/**
 * Translate a message we produced, or a known provider error.
 * Unknown provider text is returned unchanged so we never invent wording.
 */
export function translateKnownError(message: string, t: TFunction): string {
  const trimmed = message.trim()
  const exact = EXACT_ERRORS[trimmed]
  if (exact) return t(exact)

  const trial = trimmed.match(/^Free trial is limited to (\d+) properties/)
  if (trial) return t('errors.trialPropertyLimit', { count: trial[1] })

  if (/rate limit/i.test(trimmed) || /only request this/i.test(trimmed) || /security purposes/i.test(trimmed)) {
    return t('errors.rateLimited')
  }
  if (/expired or is invalid/i.test(trimmed) || /invalid or has expired/i.test(trimmed) || /otp_expired/i.test(trimmed)) {
    return t('errors.linkExpiredProvider')
  }
  if (/already registered/i.test(trimmed) || /already been registered/i.test(trimmed)) {
    return t('errors.userExists')
  }
  if (/invalid login/i.test(trimmed)) return t('errors.invalidCredentials')
  if (/email not confirmed/i.test(trimmed)) return t('errors.emailNotConfirmed')

  return message
}
