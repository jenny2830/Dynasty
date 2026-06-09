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

export const COUNTRIES = [
  { value: 'CA', label: 'Canada' },
  { value: 'US', label: 'United States' },
  { value: 'MX', label: 'Mexico' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'PT', label: 'Portugal' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'AT', label: 'Austria' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'PL', label: 'Poland' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'HU', label: 'Hungary' },
  { value: 'RO', label: 'Romania' },
  { value: 'GR', label: 'Greece' },
  { value: 'TR', label: 'Turkey' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SG', label: 'Singapore' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'IN', label: 'India' },
  { value: 'BR', label: 'Brazil' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CO', label: 'Colombia' },
  { value: 'CL', label: 'Chile' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KE', label: 'Kenya' },
  { value: 'OTHER', label: 'Other' },
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

export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
] as const

const COUNTRY_CURRENCY: Record<string, string> = {
  CA: 'CAD',
  US: 'USD',
  CO: 'COP',
  GB: 'GBP',
  AU: 'AUD',
}

export function getCurrencyForCountry(country: string): string {
  return COUNTRY_CURRENCY[country] ?? 'CAD'
}

export function getRegionsForCountry(country: string) {
  return country === 'US' ? US_STATES : CANADIAN_PROVINCES
}

export function getRegionLabel(country: string): string {
  return country === 'US' ? 'State' : 'Province'
}

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
