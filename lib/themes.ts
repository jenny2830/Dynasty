export type ThemeId = 'dark-gold' | 'light-gold' | 'dark-rose' | 'light-rose'

export interface ThemeColors {
  // Background
  pageBg: string
  pageTexture: string

  // Sidebar
  sidebarBg: string
  sidebarBorder: string
  sidebarHatch: string
  navText: string
  navActive: string
  navActiveBg: string
  navActiveBorder: string
  sectionLabel: string
  tagline: string

  // Cards
  cardBg: string
  cardBorder: string
  cardShadow: string
  cardHoverBorder: string

  // Accent / ornaments
  accent: string
  accentLight: string
  accentDark: string
  accentMuted: string
  accentGradient: string
  accentGradientHover: string
  cornerMark: string
  topLine: string

  // Text
  textPrimary: string
  textSecondary: string
  textMuted: string
  textOnAccent: string

  // Financial
  valuePositive: string
  valueNegative: string

  // Badges
  badgePositiveBg: string
  badgePositiveText: string
  badgePositiveBorder: string
  badgeNegativeBg: string
  badgeNegativeText: string
  badgeNegativeBorder: string

  // Inputs
  inputBg: string
  inputBorder: string
  inputText: string
  inputFocusBorder: string
  inputFocusShadow: string
  inputPlaceholder: string

  // Chart
  chartIncome: string
  chartExpense: string
  chartGrid: string
  chartAxisText: string
  chartTooltipBg: string
  chartTooltipBorder: string

  // Table
  tableBg: string
  tableHeaderBg: string
  tableHeaderText: string
  tableRowBorder: string
  tableRowHover: string
  tableCellText: string

  // Misc
  scrollTrack: string
  scrollThumb: string
  selectionBg: string
  selectionText: string
  dividerColor: string
}

const gold = '#C9A84C'
const goldLight = '#E8C97A'
const goldDark = '#9A7A2E'
const goldMuted = '#8B7340'
const rose = '#B76E79'
const roseLight = '#D4959E'
const roseDark = '#8B4F58'
const roseMuted = '#9A6A72'

export const THEMES: Record<ThemeId, ThemeColors> = {
  'dark-gold': {
    pageBg: '#0A0A0A',
    pageTexture: 'repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(201,168,76,0.008) 60px, rgba(201,168,76,0.008) 61px), repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(201,168,76,0.008) 60px, rgba(201,168,76,0.008) 61px)',

    sidebarBg: '#080808',
    sidebarBorder: '1px solid rgba(201,168,76,0.12)',
    sidebarHatch: 'repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(201,168,76,0.018) 28px, rgba(201,168,76,0.018) 29px), repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(201,168,76,0.018) 28px, rgba(201,168,76,0.018) 29px)',
    navText: '#9A8F7A',
    navActive: gold,
    navActiveBg: 'rgba(201,168,76,0.07)',
    navActiveBorder: gold,
    sectionLabel: '#6B6B65',
    tagline: 'rgba(201,168,76,0.45)',

    cardBg: 'linear-gradient(160deg, #141414 0%, #1A1815 100%)',
    cardBorder: '1px solid rgba(201,168,76,0.12)',
    cardShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,168,76,0.06)',
    cardHoverBorder: '1px solid rgba(201,168,76,0.28)',

    accent: gold,
    accentLight: goldLight,
    accentDark: goldDark,
    accentMuted: goldMuted,
    accentGradient: `linear-gradient(135deg, ${gold} 0%, ${goldDark} 100%)`,
    accentGradientHover: `linear-gradient(135deg, ${goldLight} 0%, ${gold} 100%)`,
    cornerMark: 'rgba(201,168,76,0.5)',
    topLine: `linear-gradient(90deg, transparent, ${gold}, transparent)`,

    textPrimary: '#FAF7F2',
    textSecondary: '#B5B5AA',
    textMuted: '#8A8A82',
    textOnAccent: '#080808',

    valuePositive: gold,
    valueNegative: rose,

    badgePositiveBg: 'rgba(201,168,76,0.08)',
    badgePositiveText: gold,
    badgePositiveBorder: 'rgba(201,168,76,0.2)',
    badgeNegativeBg: 'rgba(183,110,121,0.08)',
    badgeNegativeText: rose,
    badgeNegativeBorder: 'rgba(183,110,121,0.2)',

    inputBg: '#111111',
    inputBorder: 'rgba(201,168,76,0.12)',
    inputText: '#FAF7F2',
    inputFocusBorder: 'rgba(201,168,76,0.45)',
    inputFocusShadow: '0 0 0 3px rgba(201,168,76,0.05)',
    inputPlaceholder: '#4A4A45',

    chartIncome: gold,
    chartExpense: rose,
    chartGrid: 'rgba(255,255,255,0.04)',
    chartAxisText: '#4A4A45',
    chartTooltipBg: '#161616',
    chartTooltipBorder: 'rgba(201,168,76,0.2)',

    tableBg: '#0F0F0F',
    tableHeaderBg: '#080808',
    tableHeaderText: '#4A4A45',
    tableRowBorder: 'rgba(255,255,255,0.025)',
    tableRowHover: 'rgba(201,168,76,0.025)',
    tableCellText: '#8A8A82',

    scrollTrack: '#080808',
    scrollThumb: 'rgba(201,168,76,0.2)',
    selectionBg: 'rgba(201,168,76,0.2)',
    selectionText: '#FAF7F2',
    dividerColor: 'rgba(201,168,76,0.1)',
  },

  'light-gold': {
    pageBg: '#FAF7F2',
    pageTexture: 'none',

    sidebarBg: '#F0EBE3',
    sidebarBorder: '1px solid rgba(154,122,46,0.18)',
    sidebarHatch: 'none',
    navText: '#5C5548',
    navActive: goldDark,
    navActiveBg: 'rgba(154,122,46,0.08)',
    navActiveBorder: goldDark,
    sectionLabel: '#8A8A82',
    tagline: 'rgba(154,122,46,0.5)',

    cardBg: '#EEEAE2',
    cardBorder: '1px solid rgba(154,122,46,0.15)',
    cardShadow: '0 2px 12px rgba(0,0,0,0.04)',
    cardHoverBorder: '1px solid rgba(154,122,46,0.3)',

    accent: goldDark,
    accentLight: gold,
    accentDark: '#7A6020',
    accentMuted: '#8B7340',
    accentGradient: `linear-gradient(135deg, ${gold} 0%, ${goldDark} 100%)`,
    accentGradientHover: `linear-gradient(135deg, ${goldLight} 0%, ${gold} 100%)`,
    cornerMark: 'rgba(154,122,46,0.25)',
    topLine: `linear-gradient(90deg, transparent, ${goldDark}, transparent)`,

    textPrimary: '#1C1A17',
    textSecondary: '#5C5548',
    textMuted: '#8A8A82',
    textOnAccent: '#FFFFFF',

    valuePositive: goldDark,
    valueNegative: roseDark,

    badgePositiveBg: 'rgba(154,122,46,0.1)',
    badgePositiveText: goldDark,
    badgePositiveBorder: 'rgba(154,122,46,0.2)',
    badgeNegativeBg: 'rgba(139,79,88,0.1)',
    badgeNegativeText: roseDark,
    badgeNegativeBorder: 'rgba(139,79,88,0.2)',

    inputBg: '#FFFFFF',
    inputBorder: 'rgba(154,122,46,0.2)',
    inputText: '#1C1A17',
    inputFocusBorder: 'rgba(154,122,46,0.45)',
    inputFocusShadow: '0 0 0 3px rgba(154,122,46,0.06)',
    inputPlaceholder: '#B5B5AA',

    chartIncome: goldDark,
    chartExpense: roseDark,
    chartGrid: 'rgba(0,0,0,0.05)',
    chartAxisText: '#8A8A82',
    chartTooltipBg: '#FFFFFF',
    chartTooltipBorder: 'rgba(154,122,46,0.2)',

    tableBg: '#F5F0E8',
    tableHeaderBg: '#EBE5DA',
    tableHeaderText: '#8A8A82',
    tableRowBorder: 'rgba(0,0,0,0.04)',
    tableRowHover: 'rgba(154,122,46,0.04)',
    tableCellText: '#5C5548',

    scrollTrack: '#FAF7F2',
    scrollThumb: 'rgba(154,122,46,0.2)',
    selectionBg: 'rgba(154,122,46,0.15)',
    selectionText: '#1C1A17',
    dividerColor: 'rgba(154,122,46,0.12)',
  },

  'dark-rose': {
    pageBg: '#0A0808',
    pageTexture: 'repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(183,110,121,0.008) 60px, rgba(183,110,121,0.008) 61px), repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(183,110,121,0.008) 60px, rgba(183,110,121,0.008) 61px)',

    sidebarBg: '#0A0808',
    sidebarBorder: '1px solid rgba(183,110,121,0.12)',
    sidebarHatch: 'repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(183,110,121,0.018) 28px, rgba(183,110,121,0.018) 29px), repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(183,110,121,0.018) 28px, rgba(183,110,121,0.018) 29px)',
    navText: '#8A7A7E',
    navActive: rose,
    navActiveBg: 'rgba(183,110,121,0.07)',
    navActiveBorder: rose,
    sectionLabel: '#5C5055',
    tagline: 'rgba(183,110,121,0.45)',

    cardBg: 'linear-gradient(160deg, #141212 0%, #1A1618 100%)',
    cardBorder: '1px solid rgba(183,110,121,0.12)',
    cardShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(183,110,121,0.06)',
    cardHoverBorder: '1px solid rgba(183,110,121,0.28)',

    accent: rose,
    accentLight: roseLight,
    accentDark: roseDark,
    accentMuted: roseMuted,
    accentGradient: `linear-gradient(135deg, ${rose} 0%, ${roseDark} 100%)`,
    accentGradientHover: `linear-gradient(135deg, ${roseLight} 0%, ${rose} 100%)`,
    cornerMark: 'rgba(183,110,121,0.5)',
    topLine: `linear-gradient(90deg, transparent, ${rose}, transparent)`,

    textPrimary: '#FAF5F6',
    textSecondary: '#B5AAAD',
    textMuted: '#8A8084',
    textOnAccent: '#0A0808',

    valuePositive: rose,
    valueNegative: gold,

    badgePositiveBg: 'rgba(183,110,121,0.08)',
    badgePositiveText: rose,
    badgePositiveBorder: 'rgba(183,110,121,0.2)',
    badgeNegativeBg: 'rgba(201,168,76,0.08)',
    badgeNegativeText: gold,
    badgeNegativeBorder: 'rgba(201,168,76,0.2)',

    inputBg: '#121010',
    inputBorder: 'rgba(183,110,121,0.12)',
    inputText: '#FAF5F6',
    inputFocusBorder: 'rgba(183,110,121,0.45)',
    inputFocusShadow: '0 0 0 3px rgba(183,110,121,0.05)',
    inputPlaceholder: '#4A4245',

    chartIncome: rose,
    chartExpense: gold,
    chartGrid: 'rgba(255,255,255,0.04)',
    chartAxisText: '#4A4245',
    chartTooltipBg: '#181414',
    chartTooltipBorder: 'rgba(183,110,121,0.2)',

    tableBg: '#100E0E',
    tableHeaderBg: '#0A0808',
    tableHeaderText: '#5C5055',
    tableRowBorder: 'rgba(255,255,255,0.025)',
    tableRowHover: 'rgba(183,110,121,0.025)',
    tableCellText: '#8A8084',

    scrollTrack: '#0A0808',
    scrollThumb: 'rgba(183,110,121,0.2)',
    selectionBg: 'rgba(183,110,121,0.2)',
    selectionText: '#FAF5F6',
    dividerColor: 'rgba(183,110,121,0.1)',
  },

  'light-rose': {
    pageBg: '#FDF8F6',
    pageTexture: 'none',

    sidebarBg: '#F8EDE9',
    sidebarBorder: '1px solid rgba(183,110,121,0.18)',
    sidebarHatch: 'none',
    navText: '#7A5A60',
    navActive: roseDark,
    navActiveBg: 'rgba(183,110,121,0.08)',
    navActiveBorder: roseDark,
    sectionLabel: '#B39A9E',
    tagline: 'rgba(183,110,121,0.5)',

    cardBg: '#F2E4E0',
    cardBorder: '1px solid rgba(183,110,121,0.15)',
    cardShadow: '0 2px 12px rgba(139,79,88,0.05)',
    cardHoverBorder: '1px solid rgba(183,110,121,0.3)',

    accent: roseDark,
    accentLight: rose,
    accentDark: '#6A3A44',
    accentMuted: roseMuted,
    accentGradient: `linear-gradient(135deg, ${rose} 0%, ${roseDark} 100%)`,
    accentGradientHover: `linear-gradient(135deg, ${roseLight} 0%, ${rose} 100%)`,
    cornerMark: 'rgba(183,110,121,0.3)',
    topLine: `linear-gradient(90deg, transparent, ${roseDark}, transparent)`,

    textPrimary: '#3D2A2E',
    textSecondary: '#5C3F44',
    textMuted: '#8A6A70',
    textOnAccent: '#FFFFFF',

    valuePositive: roseDark,
    valueNegative: goldDark,

    badgePositiveBg: 'rgba(183,110,121,0.1)',
    badgePositiveText: roseDark,
    badgePositiveBorder: 'rgba(183,110,121,0.2)',
    badgeNegativeBg: 'rgba(154,122,46,0.1)',
    badgeNegativeText: goldDark,
    badgeNegativeBorder: 'rgba(154,122,46,0.2)',

    inputBg: '#FFFFFF',
    inputBorder: 'rgba(183,110,121,0.2)',
    inputText: '#3D2A2E',
    inputFocusBorder: 'rgba(183,110,121,0.45)',
    inputFocusShadow: '0 0 0 3px rgba(183,110,121,0.06)',
    inputPlaceholder: '#C0AAAE',

    chartIncome: roseDark,
    chartExpense: goldDark,
    chartGrid: 'rgba(0,0,0,0.05)',
    chartAxisText: '#B39A9E',
    chartTooltipBg: '#FFFFFF',
    chartTooltipBorder: 'rgba(183,110,121,0.2)',

    tableBg: '#F5E8E4',
    tableHeaderBg: '#EDD8D4',
    tableHeaderText: '#8A6A70',
    tableRowBorder: 'rgba(0,0,0,0.04)',
    tableRowHover: 'rgba(183,110,121,0.04)',
    tableCellText: '#5C3F44',

    scrollTrack: '#FDF8F6',
    scrollThumb: 'rgba(183,110,121,0.2)',
    selectionBg: 'rgba(183,110,121,0.15)',
    selectionText: '#3D2A2E',
    dividerColor: 'rgba(183,110,121,0.12)',
  },
}

export const THEME_META: Record<ThemeId, { name: string; description: string }> = {
  'dark-gold':  { name: 'Dark Gold',  description: 'Black & gold — the signature Dynasty look' },
  'light-gold': { name: 'Light Gold', description: 'Cream & gold — clean and elegant' },
  'dark-rose':  { name: 'Dark Rose',  description: 'Black & rose gold — refined luxury' },
  'light-rose': { name: 'Light Rose', description: 'Cream & rose gold — soft and premium' },
}

/** Returns a valid ThemeId, defaulting to 'dark-gold' for unknown values */
export function toThemeId(value: string | null | undefined): ThemeId {
  if (value === 'dark-gold' || value === 'light-gold' || value === 'dark-rose' || value === 'light-rose') {
    return value
  }
  // Legacy values from old 2-theme system
  if (value === 'light') return 'light-gold'
  return 'dark-gold'
}
