import { useAppTheme } from './theme-context'

export function useThemeStyles() {
  const { theme, fontWeights } = useAppTheme()

  return {
    // Page titles
    pageTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: fontWeights.semibold,
      fontSize: 'clamp(22px, 4vw, 30px)',
      color: theme.textPrimary,
      letterSpacing: '0.04em',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    } as React.CSSProperties,

    // Card labels (PORTFOLIO VALUE, etc.)
    cardLabel: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.thin,
      fontSize: '9px',
      letterSpacing: '0.22em',
      textTransform: 'uppercase' as const,
      color: theme.accent,
    } as React.CSSProperties,

    // Card values ($0, etc.)
    cardValue: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontWeight: fontWeights.medium,
      fontSize: 'clamp(28px, 5vw, 38px)',
      color: theme.accent,
      lineHeight: 1,
    } as React.CSSProperties,

    // Body text
    bodyText: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.body,
      fontSize: '13px',
      color: theme.textSecondary,
      wordBreak: 'break-word' as const,
    } as React.CSSProperties,

    // Muted/subtitle text
    mutedText: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.thin,
      fontSize: '12px',
      color: theme.textMuted,
      letterSpacing: '0.06em',
      wordBreak: 'break-word' as const,
    } as React.CSSProperties,

    // Section labels (PORTFOLIO, INTELLIGENCE, etc.)
    sectionLabel: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.thin,
      fontSize: '8px',
      letterSpacing: '0.22em',
      textTransform: 'uppercase' as const,
      color: theme.sectionLabel,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    } as React.CSSProperties,

    // Nav items (inactive)
    navItem: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.thin,
      fontSize: '11px',
      letterSpacing: '0.14em',
      textTransform: 'uppercase' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '100%',
    } as React.CSSProperties,

    // Nav items (active)
    navItemActive: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.medium,
      fontSize: '11px',
      letterSpacing: '0.14em',
      textTransform: 'uppercase' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '100%',
    } as React.CSSProperties,

    // Buttons
    buttonText: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.medium,
      fontSize: '10px',
      letterSpacing: '0.22em',
      textTransform: 'uppercase' as const,
    } as React.CSSProperties,

    // Input labels
    inputLabel: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.thin,
      fontSize: '10px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      color: theme.textMuted,
      marginBottom: '7px',
      display: 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    } as React.CSSProperties,

    // Input fields
    inputField: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.body,
      fontSize: '13px',
      color: theme.inputText,
      background: theme.inputBg,
      border: `1px solid ${theme.inputBorder}`,
      borderRadius: '1px',
      padding: '11px 15px',
      width: '100%',
      outline: 'none',
    } as React.CSSProperties,

    // Financial numbers
    financial: {
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: fontWeights.medium,
      fontSize: '13px',
    } as React.CSSProperties,

    // Table header
    tableHeader: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.thin,
      fontSize: '9px',
      letterSpacing: '0.2em',
      textTransform: 'uppercase' as const,
      color: theme.tableHeaderText,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    } as React.CSSProperties,

    // Table cell
    tableCell: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.body,
      fontSize: '13px',
      color: theme.tableCellText,
      wordBreak: 'break-word' as const,
    } as React.CSSProperties,

    // Badge
    badge: {
      fontFamily: "'Jost', sans-serif",
      fontWeight: fontWeights.thin,
      fontSize: '9px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      padding: '3px 10px',
      borderRadius: '1px',
    } as React.CSSProperties,

    // Heading h3 (card titles like "Income vs Expenses")
    cardTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: fontWeights.medium,
      fontSize: '18px',
      color: theme.textPrimary,
      overflow: 'hidden',
      wordBreak: 'break-word' as const,
    } as React.CSSProperties,
  }
}
