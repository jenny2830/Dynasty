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
        borderBottom: '1px solid rgba(201,168,76,0.08)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: '30px',
            color: '#FAF7F2',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            lineHeight: 1.2,
            margin: 0,
          }}>
            <span style={{ color: '#C9A84C', fontSize: '8px', opacity: 0.7 }}>◆</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          </h1>

          {subtitle && (
            <p style={{
              marginTop: '6px',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: '#6B6B65',
              margin: '6px 0 0 0',
            }}>
              {subtitle}
            </p>
          )}

          {/* Gold rule */}
          <div style={{ width: '32px', height: '1px', background: 'rgba(201,168,76,0.5)', marginTop: '12px', marginBottom: '0' }} aria-hidden />
        </div>

        {children && (
          <div style={{ display: 'flex', flexShrink: 0, alignItems: 'center', gap: '12px' }}>{children}</div>
        )}
      </div>
    </header>
  )
}
