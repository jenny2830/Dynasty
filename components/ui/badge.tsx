import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  [
    'inline-flex items-center rounded-[1px] px-2.5 py-[3px]',
    'font-sans font-light uppercase',
    'text-[9px] tracking-[0.15em] leading-none',
    'border transition-colors',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-[var(--badge-pos-bg)] text-[var(--badge-pos-text)]',
          'border-[var(--badge-pos-border)]',
        ].join(' '),
        secondary: [
          'bg-[var(--section-bg,rgba(74,74,69,0.15))] text-[var(--text-muted-c)]',
          'border-[var(--divider-c,rgba(74,74,69,0.25))]',
        ].join(' '),
        destructive: [
          'bg-[var(--badge-neg-bg)] text-[var(--badge-neg-text)]',
          'border-[var(--badge-neg-border)]',
        ].join(' '),
        outline: [
          'bg-transparent text-[var(--text-secondary-c)]',
          'border-[var(--card-border-color,rgba(201,168,76,0.12))]',
        ].join(' '),
        success: [
          'bg-[var(--badge-pos-bg)] text-[var(--badge-pos-text)]',
          'border-[var(--badge-pos-border)]',
        ].join(' '),
        warning: [
          'bg-[var(--badge-neg-bg)] text-[var(--badge-neg-text)]',
          'border-[var(--badge-neg-border)]',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
