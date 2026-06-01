import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[1px] px-4 py-2.5',
          'bg-[var(--input-bg)] text-[var(--text-primary-c)]',
          'border border-[var(--input-border-color)]',
          'font-sans font-light text-[13px] tracking-[0.01em]',
          'placeholder:text-[var(--placeholder-c)]',
          'transition-[border-color,box-shadow] duration-200',
          'focus:outline-none focus:border-[var(--input-focus-border)]',
          'focus:[box-shadow:var(--input-focus-shadow)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
