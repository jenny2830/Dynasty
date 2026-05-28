import * as React from 'react'
import { cn } from '@/lib/utils'

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'warm'
}

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    void variant
    return (
      <div
        ref={ref}
        className={cn(className)}
        style={{
          background: '#111111',
          border: '1px solid rgba(201,168,76,0.1)',
          borderRadius: '2px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
        {...props}
      >
        {/* Top-left corner mark */}
        <div style={{ position: 'absolute', top: '6px', left: '6px', width: '14px', height: '14px', borderTop: '1px solid rgba(201,168,76,0.5)', borderLeft: '1px solid rgba(201,168,76,0.5)', pointerEvents: 'none', zIndex: 1 }} />
        {/* Bottom-right corner mark */}
        <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '14px', height: '14px', borderBottom: '1px solid rgba(201,168,76,0.5)', borderRight: '1px solid rgba(201,168,76,0.5)', pointerEvents: 'none', zIndex: 1 }} />
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
        borderBottom: '1px solid rgba(201,168,76,0.08)',
      }}
      {...props}
    >
      <div style={{ minWidth: 0 }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '18px',
          fontWeight: 500,
          letterSpacing: '0.02em',
          color: '#FAF7F2',
          margin: 0,
        }}>
          {title}
        </h2>
        {description && (
          <p style={{
            marginTop: '2px',
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#4A4A45',
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
