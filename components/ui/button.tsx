import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[1px] uppercase font-sans font-medium',
    'tracking-[0.18em] transition-all duration-300 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dynasty-gold/40',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'text-dynasty-black',
          'bg-[linear-gradient(135deg,#C9A84C_0%,#9A7A2E_100%)]',
          'shadow-[0_4px_16px_rgba(201,168,76,0.18)]',
          'hover:bg-[linear-gradient(135deg,#E8C97A_0%,#C9A84C_100%)]',
          'hover:shadow-[0_6px_24px_rgba(201,168,76,0.28)]',
          'hover:-translate-y-[1px]',
          'active:translate-y-0',
        ].join(' '),
        destructive: [
          'bg-transparent text-dynasty-rose-gold',
          'border border-[rgba(183,110,121,0.25)]',
          'hover:bg-[rgba(183,110,121,0.06)]',
          'hover:border-[rgba(183,110,121,0.45)]',
        ].join(' '),
        outline: [
          'bg-transparent text-dynasty-gold',
          'border border-[rgba(201,168,76,0.25)]',
          'hover:bg-[rgba(201,168,76,0.06)]',
          'hover:border-[rgba(201,168,76,0.45)]',
        ].join(' '),
        secondary: [
          'bg-dynasty-black-card text-dynasty-cream',
          'border border-[rgba(201,168,76,0.1)]',
          'hover:border-[rgba(201,168,76,0.25)]',
          'hover:bg-dynasty-black-warm',
        ].join(' '),
        ghost: [
          'bg-transparent text-dynasty-gray-400 normal-case tracking-normal font-normal',
          'hover:text-dynasty-gold hover:bg-[rgba(201,168,76,0.04)]',
        ].join(' '),
        link: [
          'text-dynasty-gold underline-offset-4 hover:underline',
          'normal-case tracking-normal',
        ].join(' '),
      },
      size: {
        default: 'h-10 px-9 py-3 text-[10px] [&_svg]:size-3.5',
        sm: 'h-8 px-5 text-[9px] [&_svg]:size-3.5',
        lg: 'h-12 px-12 text-[11px] [&_svg]:size-4',
        icon: [
          'h-9 w-9 p-0',
          'bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.12)]',
          'text-dynasty-gray-400',
          'hover:text-dynasty-gold hover:border-[rgba(201,168,76,0.3)]',
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
