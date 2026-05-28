import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-dynasty-gray-600 bg-dynasty-gray-800 px-4 py-2.5 text-sm text-dynasty-cream placeholder:text-dynasty-gray-400 resize-none transition-colors',
          'focus:border-dynasty-gold focus:outline-none focus:ring-1 focus:ring-dynasty-gold/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
