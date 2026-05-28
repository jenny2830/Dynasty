import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

/**
 * Standardized Art Deco page header.
 *
 * - Diamond (◆) ornament before the title
 * - Cormorant Garamond serif title with generous tracking
 * - Jost light uppercase eyebrow subtitle
 * - Thin 40px gold rule beneath
 * - Bottom border for full-width section separation
 *
 * Use `children` slot for right-side actions (buttons, links).
 */
export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-8 pb-5 border-b border-[rgba(201,168,76,0.08)]',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-3 font-serif text-[30px] font-semibold leading-tight tracking-[0.04em] text-dynasty-warm-white">
            <span className="text-[10px] text-dynasty-gold/70 leading-none">◆</span>
            <span className="truncate">{title}</span>
          </h1>
          {subtitle && (
            <p className="mt-1.5 font-sans text-[12px] font-light uppercase tracking-[0.16em] text-dynasty-gray-400">
              {subtitle}
            </p>
          )}
          <div className="mt-3.5 h-px w-10 bg-dynasty-gold/50" aria-hidden />
        </div>

        {children && (
          <div className="flex shrink-0 items-center gap-3">{children}</div>
        )}
      </div>
    </header>
  )
}
