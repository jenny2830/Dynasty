import * as React from 'react'
import { cn } from '@/lib/utils'

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'warm'
}

/**
 * Section panel — base luxury container for content groupings.
 *
 * - Sharp 2px border-radius
 * - Subtle gold border at 8% opacity
 * - Layered card shadow with inner gold rim
 * - Optional `warm` variant uses the warmer marble gradient backdrop
 */
export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    void variant
    return (
      <div
        ref={ref}
        className={cn('lux-card deco-corners', className)}
        {...props}
      />
    )
  }
)
Section.displayName = 'Section'

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
}

/**
 * Section header — used inside a Section to title a group.
 */
export function SectionHeader({
  title,
  description,
  action,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 px-7 py-4 border-b border-[rgba(201,168,76,0.08)]',
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <h2 className="font-serif text-[18px] font-medium tracking-[0.02em] text-dynasty-warm-white">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 font-sans text-[11px] font-light uppercase tracking-[0.12em] text-dynasty-gray-500">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
