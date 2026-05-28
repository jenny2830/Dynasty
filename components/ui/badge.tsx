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
          'bg-[rgba(201,168,76,0.06)] text-dynasty-gold-muted',
          'border-[rgba(201,168,76,0.18)]',
        ].join(' '),
        secondary: [
          'bg-[rgba(74,74,69,0.15)] text-dynasty-gray-400',
          'border-[rgba(74,74,69,0.25)]',
        ].join(' '),
        destructive: [
          'bg-[rgba(183,110,121,0.07)] text-dynasty-rose-gold',
          'border-[rgba(183,110,121,0.18)]',
        ].join(' '),
        outline: [
          'bg-transparent text-dynasty-gray-300',
          'border-[rgba(201,168,76,0.12)]',
        ].join(' '),
        success: [
          'bg-[rgba(201,168,76,0.07)] text-dynasty-gold',
          'border-[rgba(201,168,76,0.18)]',
        ].join(' '),
        warning: [
          'bg-[rgba(183,110,121,0.07)] text-dynasty-rose-gold',
          'border-[rgba(183,110,121,0.18)]',
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
