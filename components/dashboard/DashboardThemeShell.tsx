'use client'

import { useEffect } from 'react'
import { AppThemeProvider, useAppTheme } from '@/lib/theme-context'
import type { ThemeId } from '@/lib/themes'

interface DashboardThemeShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  initialThemeId?: ThemeId
}

/** Extract the color part from a full border string like '1px solid rgba(...)' */
function borderColor(b: string) {
  return b.includes(' solid ') ? b.split(' solid ').slice(1).join(' solid ') : b
}

function ThemedInner({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const { theme, textThickness, fontWeights, themeId } = useAppTheme()
  const mode: 'light' | 'dark' = themeId.startsWith('light') ? 'light' : 'dark'

  const cssVars: React.CSSProperties = {
    /* ── Card / Section ── */
    '--card-border': borderColor(theme.cardBorder),
    '--card-bg': theme.cardBg,
    '--card-shadow': theme.cardShadow,
    '--card-border-color': borderColor(theme.cardBorder),
    '--hover-border-color': borderColor(theme.cardHoverBorder),

    /* ── Ornaments ── */
    '--corner-color': theme.cornerMark,
    '--accent-line': theme.topLine,
    '--accent-top': theme.topLine,
    '--diamond-color': theme.cornerMark,
    '--gradient-value': theme.accentGradient,
    '--gradient-title': theme.accentGradient,

    /* ── Panel ── */
    '--panel-border': theme.dividerColor,
    '--panel-header-border': theme.dividerColor,
    '--rule-color': theme.accent,
    '--trend-positive': theme.valuePositive,
    '--shadow-card': theme.cardShadow,

    /* ── Icons ── */
    '--icon-border-hi': `${theme.accent}40`,
    '--icon-border': `${theme.accent}1F`,
    '--icon-bg-hi': `${theme.accent}0F`,
    '--icon-bg': `${theme.accent}0A`,
    '--icon-color-hi': theme.accent,
    '--icon-color': `${theme.accent}99`,

    /* ── Table ── */
    '--table-header-bg': theme.tableHeaderBg,
    '--table-row-border-c': theme.tableRowBorder,
    '--table-row-hover-bg': theme.tableRowHover,
    '--section-bg': theme.tableBg,

    /* ── Input ── */
    '--input-bg': theme.inputBg,
    '--input-border-color': theme.inputBorder,

    /* ── Menus / dropdowns / popovers (Radix portals) ── */
    '--menu-bg': theme.chartTooltipBg,
    '--menu-border': theme.chartTooltipBorder,
    '--menu-item-text': theme.textPrimary,
    '--menu-item-hover-bg': theme.tableRowHover,
    '--menu-item-active': theme.accent,
    '--menu-shadow': theme.cardShadow,

    /* ── Text colors ── */
    '--text-primary-c': theme.textPrimary,
    '--text-secondary-c': theme.textSecondary,
    '--text-muted-c': theme.textMuted,

    /* ── Accent / value ── */
    '--accent-c': theme.accent,
    '--value-pos-c': theme.valuePositive,
    '--value-neg-c': theme.valueNegative,
    '--divider-c': theme.dividerColor,

    /* ── Badge ── */
    '--badge-pos-bg': theme.badgePositiveBg,
    '--badge-pos-text': theme.badgePositiveText,
    '--badge-pos-border': theme.badgePositiveBorder,
    '--badge-neg-bg': theme.badgeNegativeBg,
    '--badge-neg-text': theme.badgeNegativeText,
    '--badge-neg-border': theme.badgeNegativeBorder,

    /* ── Accent text overlay ── */
    '--text-on-accent': theme.textOnAccent,

    /* ── Input focus / placeholder ── */
    '--placeholder-c': theme.inputPlaceholder,
    '--input-focus-border': theme.inputFocusBorder,
    '--input-focus-shadow': theme.inputFocusShadow,

    /* ── Gradient hover & button shadows ── */
    '--gradient-value-hover': theme.accentGradientHover,
    '--accent-shadow': `0 4px 16px ${theme.accent}2E`,
    '--accent-shadow-hover': `0 6px 24px ${theme.accent}47`,
    '--focus-ring': `${theme.accent}66`,

    /* ── Font weight scale (changes with textThickness) ── */
    '--fw-thin': fontWeights.thin,
    '--fw-body': fontWeights.body,
    '--fw-medium': fontWeights.medium,
    '--fw-semibold': fontWeights.semibold,
    '--fw-bold': fontWeights.bold,
  } as React.CSSProperties

  // Sync all CSS variables to <html> so Radix portals (dropdowns, dialogs)
  // rendered at document.body always inherit the active theme.
  // Also drive the document background + color-scheme so there is no dark
  // flash on refresh for light themes and native controls (date pickers,
  // scrollbars) match the active palette.
  useEffect(() => {
    const root = document.documentElement
    const entries = Object.entries(cssVars) as [string, string | number][]
    entries.forEach(([key, value]) => {
      if (key.startsWith('--') && value !== undefined) {
        root.style.setProperty(key, String(value))
      }
    })
    root.style.colorScheme = mode
    root.style.backgroundColor = theme.pageBg
    document.body.style.backgroundColor = theme.pageBg

    // Mirror all Tailwind dynasty-* color tokens onto <html> so that Radix
    // portals rendered at document.body (Select dropdowns, Dialogs, etc.)
    // also pick up the correct theme colors.  Inside .dashboard-landscape-shell
    // these are already overridden via the globals.css remapping block; setting
    // them on :root makes the same values available outside that subtree.
    const tokenMap: Record<string, string> = {
      '--color-dynasty-warm-white':  theme.textPrimary,
      '--color-dynasty-cream':       theme.textSecondary,
      '--color-dynasty-gray-200':    theme.textSecondary,
      '--color-dynasty-gray-300':    theme.textSecondary,
      '--color-dynasty-gray-400':    theme.textMuted,
      '--color-dynasty-gray-500':    theme.textMuted,
      '--color-dynasty-gray-600':    theme.inputPlaceholder,
      '--color-dynasty-black-soft':  theme.inputBg,
      '--color-dynasty-black-card':  theme.tableBg,
      '--color-dynasty-black-warm':  theme.tableHeaderBg,
      '--color-dynasty-gray-900':    theme.tableBg,
      '--color-dynasty-gray-800':    theme.tableHeaderBg,
      '--color-dynasty-gray-700':    theme.tableBg,
      '--color-dynasty-gold':        theme.accent,
      '--color-dynasty-gold-light':  theme.accentLight,
      '--color-dynasty-gold-dark':   theme.accentDark,
      '--color-dynasty-gold-muted':  theme.accentMuted,
      '--color-dynasty-rose-gold':   theme.valueNegative,
      '--color-dynasty-rose-dark':   theme.valueNegative,
      '--color-dynasty-rose-light':  theme.valueNegative,
      '--color-dynasty-black':       theme.textOnAccent,
      '--badge-pos-bg':              theme.badgePositiveBg,
      '--badge-pos-text':            theme.badgePositiveText,
      '--badge-pos-border':          theme.badgePositiveBorder,
      '--badge-neg-bg':              theme.badgeNegativeBg,
      '--badge-neg-text':            theme.badgeNegativeText,
      '--badge-neg-border':          theme.badgeNegativeBorder,
    }
    Object.entries(tokenMap).forEach(([k, v]) => root.style.setProperty(k, v))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId, textThickness])

  return (
    <div
      className="dashboard-landscape-shell"
      data-thickness={textThickness}
      data-mode={mode}
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: theme.sidebarBg,
        colorScheme: mode,
        transition: 'background-color 0.3s ease',
        ...cssVars,
      }}
    >
      {sidebar}
      <main
        className="dashboard-main"
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: theme.pageBg,
          backgroundImage: theme.pageTexture === 'none' ? undefined : theme.pageTexture,
          position: 'relative',
          transition: 'background-color 0.3s ease',
        }}
      >
        {children}
      </main>
    </div>
  )
}

export function DashboardThemeShell({ sidebar, children, initialThemeId }: DashboardThemeShellProps) {
  return (
    <AppThemeProvider initialThemeId={initialThemeId}>
      <ThemedInner sidebar={sidebar}>
        {children}
      </ThemedInner>
    </AppThemeProvider>
  )
}
