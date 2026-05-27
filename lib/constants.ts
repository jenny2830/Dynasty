export const EXPENSE_CATEGORIES = [
  'Rental income',
  'Other income',
  'Maintenance',
  'Taxes',
  'Water',
  'Garbage pickup',
  'Cleaning',
  'Management fee',
  'Accounting',
  'Insurance',
  'Condo fee',
  'Strata fee',
  'Mortgage payment',
  'Repairs',
  'Utilities',
  'Landscaping',
  'Legal fees',
  'Advertising',
  'Other expense',
] as const

export const INCOME_CATEGORIES = ['Rental income', 'Other income'] as const

export const EXPENSE_ONLY_CATEGORIES = EXPENSE_CATEGORIES.filter(
  (c) => !INCOME_CATEGORIES.includes(c as (typeof INCOME_CATEGORIES)[number])
) as string[]

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const PROPERTY_TYPES = [
  { value: 'rental', label: 'Rental' },
  { value: 'condo', label: 'Condo' },
  { value: 'strata', label: 'Strata' },
] as const

export const PROPERTY_SUBTYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
] as const

export const PROPERTY_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'inactive', label: 'Inactive' },
] as const

export const UNIT_STATUSES = [
  { value: 'occupied', label: 'Occupied' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'maintenance', label: 'Maintenance' },
] as const

export const LEASE_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'terminated', label: 'Terminated' },
] as const

export const PAYMENT_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
] as const

export const CANADIAN_PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
] as const

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 29,
    currency: 'CAD',
    maxProperties: 5,
    features: ['Up to 5 properties', 'Basic reporting', 'Receipt scanning', 'Email reminders'],
  },
  landlord: {
    name: 'Landlord',
    price: 79,
    currency: 'CAD',
    maxProperties: 20,
    features: ['Up to 20 properties', 'Advanced reports', 'ROI calculator', 'Priority support'],
  },
  portfolio: {
    name: 'Portfolio',
    price: 149,
    currency: 'CAD',
    maxProperties: Infinity,
    features: ['Unlimited properties', 'All features', 'Dedicated support', 'API access'],
  },
} as const

export const REPORT_TYPES = [
  { value: 'pl', label: 'Profit & Loss' },
  { value: 'cash_flow', label: 'Cash Flow' },
  { value: 'tax_summary', label: 'Tax Summary' },
  { value: 'expense_breakdown', label: 'Expense Breakdown' },
  { value: 'roi', label: 'ROI Analysis' },
] as const

export const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: 'LayoutDashboard' },
  { href: '/properties', label: 'Properties', icon: 'Building2' },
  { href: '/transactions', label: 'Transactions', icon: 'ArrowLeftRight' },
  { href: '/recurring', label: 'Recurring', icon: 'RefreshCw' },
  { href: '/receipts', label: 'Receipts', icon: 'ScanLine' },
  { href: '/reports', label: 'Reports', icon: 'BarChart3' },
  { href: '/roi', label: 'ROI', icon: 'TrendingUp' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
] as const
