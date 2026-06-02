export type PlanId = 'free' | 'starter' | 'landlord' | 'portfolio'

export interface PlanFeatures {
  maxProperties: number
  maxUnitsPerProperty: number
  transactions: boolean
  recurringPayments: boolean
  receiptScanner: boolean
  reports: boolean
  roiCalculator: boolean
  exportPDF: boolean
  exportCSV: boolean
  aiInsights: boolean
  listingsSync: boolean
  apiAccess: boolean
  prioritySupport: boolean
}

export const PLAN_FEATURES: Record<PlanId, PlanFeatures> = {
  free: {
    maxProperties: 3,
    maxUnitsPerProperty: 50,
    transactions: true,
    recurringPayments: true,
    receiptScanner: true,
    reports: true,
    roiCalculator: true,
    exportPDF: true,
    exportCSV: true,
    aiInsights: true,
    listingsSync: true,
    apiAccess: true,
    prioritySupport: false,
  },
  starter: {
    maxProperties: 5,
    maxUnitsPerProperty: 10,
    transactions: true,
    recurringPayments: true,
    receiptScanner: false,
    reports: true,
    roiCalculator: false,
    exportPDF: false,
    exportCSV: true,
    aiInsights: false,
    listingsSync: false,
    apiAccess: false,
    prioritySupport: false,
  },
  landlord: {
    maxProperties: 20,
    maxUnitsPerProperty: 50,
    transactions: true,
    recurringPayments: true,
    receiptScanner: true,
    reports: true,
    roiCalculator: true,
    exportPDF: true,
    exportCSV: true,
    aiInsights: true,
    listingsSync: false,
    apiAccess: false,
    prioritySupport: false,
  },
  portfolio: {
    maxProperties: 999,
    maxUnitsPerProperty: 999,
    transactions: true,
    recurringPayments: true,
    receiptScanner: true,
    reports: true,
    roiCalculator: true,
    exportPDF: true,
    exportCSV: true,
    aiInsights: true,
    listingsSync: true,
    apiAccess: true,
    prioritySupport: true,
  },
}

export const PLAN_DETAILS: Record<PlanId, {
  name: string
  price: number
  currency: string
  interval: string
  description: string
}> = {
  free: {
    name: 'Free Trial',
    price: 0,
    currency: 'CAD',
    interval: '',
    description: 'Full access for 3 sessions — up to 3 properties',
  },
  starter: {
    name: 'Starter',
    price: 29,
    currency: 'CAD',
    interval: '/month',
    description: 'For landlords with up to 5 properties',
  },
  landlord: {
    name: 'Landlord',
    price: 79,
    currency: 'CAD',
    interval: '/month',
    description: 'Full power for growing portfolios up to 20 properties',
  },
  portfolio: {
    name: 'Portfolio',
    price: 149,
    currency: 'CAD',
    interval: '/month',
    description: 'Unlimited properties with API access and priority support',
  },
}

export const FREE_TRIAL_MAX_SESSIONS = 3

export function getSessionsRemaining(sessionsUsed: number): number {
  return Math.max(0, FREE_TRIAL_MAX_SESSIONS - sessionsUsed)
}

export function hasFeatureAccess(
  plan: PlanId,
  feature: keyof PlanFeatures,
  trialExpired: boolean,
): boolean {
  if (plan === 'free' && trialExpired) return false
  if (plan === 'free') return true
  const val = PLAN_FEATURES[plan][feature]
  return val === true || (typeof val === 'number' && val > 0)
}
