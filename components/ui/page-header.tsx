import * as React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <header
      className={className}
      style={{
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--panel-header-border)',
      }}
    >
      <div className="page-header-row">
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: 'clamp(26px, 4vw, 36px)',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            lineHeight: 1.2,
            margin: 0,
          }}>
            <span style={{ color: 'var(--gold)', fontSize: '8px', opacity: 0.7 }}>◆</span>
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              background: 'var(--gradient-title)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              textShadow: '0 1px 1px rgba(0,0,0,0.25)',
            }}>{title}</span>
          </h1>

          {subtitle && (
            <p style={{
              marginTop: '6px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 400,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--text-muted, #6B6B65)',
              margin: '6px 0 0 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {subtitle}
            </p>
          )}

          {/* Accent rule */}
          <div style={{ width: '32px', height: '1px', background: 'var(--rule-color)', marginTop: '12px', marginBottom: '0' }} aria-hidden />
        </div>

        {children && (
          <div className="page-header-actions" style={{ display: 'flex', flexShrink: 0, alignItems: 'center', gap: '12px' }}>{children}</div>
        )}
      </div>
    </header>
  )
}
