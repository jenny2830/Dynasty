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
          'bg-dynasty-black-soft text-dynasty-warm-white',
          'border border-[rgba(201,168,76,0.12)]',
          'font-sans font-light text-[13px] tracking-[0.01em]',
          'placeholder:text-dynasty-gray-600 placeholder:font-light',
          'transition-[border-color,box-shadow] duration-200',
          'focus:outline-none focus:border-[rgba(201,168,76,0.45)]',
          'focus:shadow-[0_0_0_3px_rgba(201,168,76,0.05)]',
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
