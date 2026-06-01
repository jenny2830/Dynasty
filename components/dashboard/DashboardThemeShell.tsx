'use client'

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
  const { theme } = useAppTheme()

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
    '--badge-neg-bg': theme.badgeNegativeBg,
    '--badge-neg-text': theme.badgeNegativeText,

    /* ── Accent text overlay ── */
    '--text-on-accent': theme.textOnAccent,
  } as React.CSSProperties

  return (
    <div
      className="dashboard-landscape-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: theme.sidebarBg,
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
