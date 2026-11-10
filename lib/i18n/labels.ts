import type { MessageKey } from './en'
import type { Locale } from './types'
import type { TFunction } from './translate'

const CATEGORY_KEYS: Record<string, MessageKey> = {
  'Rental income': 'cat.rentalIncome',
  'Other income': 'cat.otherIncome',
  Maintenance: 'cat.maintenance',
  Taxes: 'cat.taxes',
  Water: 'cat.water',
  'Garbage pickup': 'cat.garbage',
  Cleaning: 'cat.cleaning',
  'Management fee': 'cat.management',
  Accounting: 'cat.accounting',
  Insurance: 'cat.insurance',
  'Condo fee': 'cat.condoFee',
  'Strata fee': 'cat.strataFee',
  'Mortgage payment': 'cat.mortgagePayment',
  Repairs: 'cat.repairs',
  Utilities: 'cat.utilities',
  Landscaping: 'cat.landscaping',
  'Legal fees': 'cat.legal',
  Advertising: 'cat.advertising',
  'Other expense': 'cat.otherExpense',
}

const ENUM_KEYS: Record<string, MessageKey> = {
  rental: 'enum.rental',
  condo: 'enum.condo',
  strata: 'enum.strata',
  residential: 'enum.residential',
  commercial: 'enum.commercial',
  active: 'enum.active',
  vacant: 'enum.vacant',
  inactive: 'enum.inactive',
  occupied: 'enum.occupied',
  maintenance: 'enum.maintenance',
  expired: 'enum.expired',
  terminated: 'enum.terminated',
  weekly: 'enum.weekly',
  monthly: 'enum.monthly',
  quarterly: 'enum.quarterly',
  annually: 'enum.annually',
  confirmed: 'enum.confirmed',
  rejected: 'enum.rejected',
  pending: 'enum.pending',
  income: 'enum.income',
  expense: 'enum.expense',
}

const COUNTRY_KEYS: Record<string, MessageKey> = {
  CA: 'geo.canada',
  US: 'geo.unitedStates',
  CO: 'geo.colombia',
  GB: 'geo.unitedKingdom',
  AU: 'geo.australia',
  MX: 'geo.mexico',
}

const REGION_KIND: Record<string, MessageKey> = {
  Province: 'geo.province',
  State: 'geo.state',
  Department: 'geo.department',
  County: 'geo.county',
}

/** Spanish names for regions whose stored value stays the canonical English (or official) name. */
const REGION_ES: Record<string, string> = {
  Alberta: 'Alberta',
  'British Columbia': 'Columbia Británica',
  Manitoba: 'Manitoba',
  'New Brunswick': 'Nuevo Brunswick',
  'Newfoundland and Labrador': 'Terranova y Labrador',
  'Northwest Territories': 'Territorios del Noroeste',
  'Nova Scotia': 'Nueva Escocia',
  Nunavut: 'Nunavut',
  Ontario: 'Ontario',
  'Prince Edward Island': 'Isla del Príncipe Eduardo',
  Quebec: 'Quebec',
  Saskatchewan: 'Saskatchewan',
  Yukon: 'Yukón',
  Alabama: 'Alabama',
  Alaska: 'Alaska',
  Arizona: 'Arizona',
  Arkansas: 'Arkansas',
  California: 'California',
  Colorado: 'Colorado',
  Connecticut: 'Connecticut',
  Delaware: 'Delaware',
  Florida: 'Florida',
  Georgia: 'Georgia',
  Hawaii: 'Hawái',
  Idaho: 'Idaho',
  Illinois: 'Illinois',
  Indiana: 'Indiana',
  Iowa: 'Iowa',
  Kansas: 'Kansas',
  Kentucky: 'Kentucky',
  Louisiana: 'Luisiana',
  Maine: 'Maine',
  Maryland: 'Maryland',
  Massachusetts: 'Massachusetts',
  Michigan: 'Míchigan',
  Minnesota: 'Minnesota',
  Mississippi: 'Misisipi',
  Missouri: 'Misuri',
  Montana: 'Montana',
  Nebraska: 'Nebraska',
  Nevada: 'Nevada',
  'New Hampshire': 'Nuevo Hampshire',
  'New Jersey': 'Nueva Jersey',
  'New Mexico': 'Nuevo México',
  'New York': 'Nueva York',
  'North Carolina': 'Carolina del Norte',
  'North Dakota': 'Dakota del Norte',
  Ohio: 'Ohio',
  Oklahoma: 'Oklahoma',
  Oregon: 'Oregón',
  Pennsylvania: 'Pensilvania',
  'Rhode Island': 'Rhode Island',
  'South Carolina': 'Carolina del Sur',
  'South Dakota': 'Dakota del Sur',
  Tennessee: 'Tennessee',
  Texas: 'Texas',
  Utah: 'Utah',
  Vermont: 'Vermont',
  Virginia: 'Virginia',
  Washington: 'Washington',
  'West Virginia': 'Virginia Occidental',
  Wisconsin: 'Wisconsin',
  Wyoming: 'Wyoming',
  'District of Columbia': 'Distrito de Columbia',
  England: 'Inglaterra',
  Scotland: 'Escocia',
  Wales: 'Gales',
  'Northern Ireland': 'Irlanda del Norte',
  'Greater London': 'Gran Londres',
  'New South Wales': 'Nueva Gales del Sur',
  'Northern Territory': 'Territorio del Norte',
  Queensland: 'Queensland',
  'South Australia': 'Australia Meridional',
  Tasmania: 'Tasmania',
  Victoria: 'Victoria',
  'Western Australia': 'Australia Occidental',
  'Australian Capital Territory': 'Territorio de la Capital Australiana',
  'Ciudad de México': 'Ciudad de México',
}

const CHART_KEYS: Record<string, MessageKey> = {
  income: 'overview.chartIncome',
  expenses: 'overview.chartExpenses',
  Income: 'common.income',
  Expense: 'common.expense',
  Expenses: 'overview.chartExpenses',
  'Net Cash Flow': 'roi.netCashFlow',
  Mortgage: 'properties.mortgage',
  'Operating Exp': 'roi.operatingExp',
  'Gross Rent': 'roi.grossRent',
  'Net Income': 'tx.netIncome',
  'Property Value': 'roi.propertyValue',
  Equity: 'roi.equity',
  'Cumulative Cash Flow': 'roi.cumulativeCash',
  'Cap Rate': 'roi.capRate',
  'Cash-on-Cash': 'roi.cashOnCash',
  'Gross Yield': 'roi.grossYield',
  'Net Yield': 'roi.netYield',
  Annual: 'roi.annual',
}

const THEME_NAME: Record<string, MessageKey> = {
  'dark-gold': 'theme.darkGold',
  'light-gold': 'theme.lightGold',
  'dark-rose': 'theme.darkRose',
  'light-rose': 'theme.lightRose',
}

const THEME_HELP: Record<string, MessageKey> = {
  'dark-gold': 'theme.darkGoldHelp',
  'light-gold': 'theme.lightGoldHelp',
  'dark-rose': 'theme.darkRoseHelp',
  'light-rose': 'theme.lightRoseHelp',
}

function fromMap(value: string, map: Record<string, MessageKey>, t: TFunction): string {
  const key = map[value]
  return key ? t(key) : value
}

/** Display label for a stored category. Unknown (custom) values stay as entered. */
export function categoryLabel(value: string, t: TFunction): string {
  return fromMap(value, CATEGORY_KEYS, t)
}

/** Display label for a stored enum (type, status, frequency). */
export function enumLabel(value: string, t: TFunction): string {
  return fromMap(value, ENUM_KEYS, t)
}

export function countryLabel(code: string, fallbackName: string, t: TFunction): string {
  const key = COUNTRY_KEYS[code]
  return key ? t(key) : fallbackName
}

export function regionKindLabel(englishKind: string, t: TFunction): string {
  return fromMap(englishKind, REGION_KIND, t)
}

/** Display name for a region. The stored value is unchanged. */
export function regionDisplay(name: string, locale: Locale): string {
  if (locale !== 'es') return name
  return REGION_ES[name] ?? name
}

export function chartLabel(name: string, t: TFunction): string {
  return fromMap(name, CHART_KEYS, t)
}

export function themeName(id: string, t: TFunction): string {
  return fromMap(id, THEME_NAME, t)
}

export function themeHelp(id: string, t: TFunction): string {
  return fromMap(id, THEME_HELP, t)
}
