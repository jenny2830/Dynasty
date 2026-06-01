'use client'

import { AppThemeProvider, useAppTheme } from '@/lib/theme-context'
import type { ThemeId } from '@/lib/themes'

interface DashboardThemeShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  initialThemeId?: ThemeId
}

function ThemedInner({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const { theme } = useAppTheme()

  // Derive CSS custom property values from the current theme so that
  // server-rendered components that still use var(--card-border) etc. 
  // automatically respond to theme switches.
  const cssVars = {
    '--card-border': theme.cardBorder.includes('solid')
      ? theme.cardBorder.split(' solid ').slice(1).join(' solid ')
      : theme.cardBorder,
    '--card-shadow': theme.cardShadow,
    '--corner-color': theme.cornerMark,
    '--accent-line': theme.topLine,
    '--diamond-color': theme.cornerMark,
    '--gradient-value': theme.accentGradient,
    '--gradient-title': theme.accentGradient,
    '--trend-positive': theme.valuePositive,
    '--panel-border': theme.dividerColor,
    '--panel-header-border': theme.dividerColor,
    '--rule-color': theme.accent,
    '--icon-border-hi': `${theme.accent}40`,
    '--icon-border': `${theme.accent}1F`,
    '--icon-bg-hi': `${theme.accent}0F`,
    '--icon-bg': `${theme.accent}0A`,
    '--icon-color-hi': theme.accent,
    '--icon-color': `${theme.accent}99`,
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
