import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[1px] uppercase font-sans font-medium',
    'tracking-[0.18em] transition-all duration-300 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring,rgba(201,168,76,0.4))]',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'text-[var(--text-on-accent,#080808)]',
          '[background:var(--gradient-value,linear-gradient(135deg,#C9A84C_0%,#9A7A2E_100%))]',
          'shadow-[var(--accent-shadow,0_4px_16px_rgba(201,168,76,0.18))]',
          'hover:[background:var(--gradient-value-hover,linear-gradient(135deg,#E8C97A_0%,#C9A84C_100%))]',
          'hover:shadow-[var(--accent-shadow-hover,0_6px_24px_rgba(201,168,76,0.28))]',
          'hover:-translate-y-[1px]',
          'active:translate-y-0',
        ].join(' '),
        destructive: [
          'bg-transparent text-[var(--value-neg-c,#B76E79)]',
          'border border-[var(--value-neg-c,rgba(183,110,121,0.25))]/25',
          'hover:bg-[var(--value-neg-c,rgba(183,110,121,0.06))]/10',
          'hover:border-[var(--value-neg-c,rgba(183,110,121,0.45))]/45',
        ].join(' '),
        outline: [
          'bg-transparent text-[var(--accent-c,#C9A84C)]',
          'border border-[var(--card-border-color,rgba(201,168,76,0.25))]',
          'hover:bg-[var(--table-row-hover-bg,rgba(201,168,76,0.06))]',
          'hover:border-[var(--hover-border-color,rgba(201,168,76,0.45))]',
        ].join(' '),
        secondary: [
          'bg-[var(--section-bg,#161616)] text-[var(--text-primary-c,#FAF7F2)]',
          'border border-[var(--card-border-color,rgba(201,168,76,0.1))]',
          'hover:border-[var(--hover-border-color,rgba(201,168,76,0.25))]',
          'hover:bg-[var(--table-header-bg,#1C1A17)]',
        ].join(' '),
        ghost: [
          'bg-transparent text-[var(--text-muted-c,#6B6B65)] normal-case tracking-normal font-normal',
          'hover:text-[var(--accent-c,#C9A84C)] hover:bg-[var(--table-row-hover-bg,rgba(201,168,76,0.04))]',
        ].join(' '),
        link: [
          'text-[var(--accent-c,#C9A84C)] underline-offset-4 hover:underline',
          'normal-case tracking-normal',
        ].join(' '),
      },
      size: {
        default: 'h-10 px-9 py-3 text-[10px] [&_svg]:size-3.5',
        sm: 'h-8 px-5 text-[9px] [&_svg]:size-3.5',
        lg: 'h-12 px-12 text-[11px] [&_svg]:size-4',
        icon: [
          'h-9 w-9 p-0',
          'bg-[var(--icon-bg,rgba(201,168,76,0.06))] border border-[var(--icon-border,rgba(201,168,76,0.12))]',
          'text-[var(--text-muted-c,#6B6B65)]',
          'hover:text-[var(--accent-c,#C9A84C)] hover:border-[var(--icon-border-hi,rgba(201,168,76,0.3))]',
          '[&_svg]:size-4',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
