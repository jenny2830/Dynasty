import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-dynasty-gray-600 bg-dynasty-gray-800 px-4 py-2 text-sm text-dynasty-cream placeholder:text-dynasty-gray-400 transition-colors',
          'focus:border-dynasty-gold focus:outline-none focus:ring-1 focus:ring-dynasty-gold/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'autofill:bg-dynasty-gray-800',
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
