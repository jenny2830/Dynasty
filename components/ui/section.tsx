'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useAppTheme } from '@/lib/theme-context'

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'warm'
}

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, variant = 'default', children, style, ...props }, ref) => {
    void variant
    const { theme } = useAppTheme()
    return (
      <div
        ref={ref}
        className={cn('lux-panel', className)}
        style={{
          background: theme.cardBg,
          border: theme.cardBorder,
          borderRadius: '2px',
          boxShadow: theme.cardShadow,
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 0.3s, border-color 0.3s',
          ...style,
        }}
        {...props}
      >
        {/* Top-left corner mark */}
        <div style={{ position: 'absolute', top: '6px', left: '6px', width: '14px', height: '14px', borderTop: `1px solid ${theme.cornerMark}`, borderLeft: `1px solid ${theme.cornerMark}`, pointerEvents: 'none', zIndex: 1 }} />
        {/* Bottom-right corner mark */}
        <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '14px', height: '14px', borderBottom: `1px solid ${theme.cornerMark}`, borderRight: `1px solid ${theme.cornerMark}`, pointerEvents: 'none', zIndex: 1 }} />
        {children}
      </div>
    )
  }
)
Section.displayName = 'Section'

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  ...props
}: SectionHeaderProps) {
  const { theme, fontWeights } = useAppTheme()
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '16px 28px',
        borderBottom: `1px solid ${theme.dividerColor}`,
      }}
      {...props}
    >
      <div style={{ minWidth: 0 }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '22px',
          fontWeight: fontWeights.semibold,
          letterSpacing: '0.02em',
          margin: 0,
          color: theme.textPrimary,
        }}>
          {title}
        </h2>
        {description && (
          <p style={{
            marginTop: '2px',
            fontFamily: "'Jost', sans-serif",
            fontWeight: fontWeights.body,
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: theme.textSecondary,
            margin: '2px 0 0 0',
          }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}
