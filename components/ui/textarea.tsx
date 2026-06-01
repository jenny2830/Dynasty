import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-[1px] px-4 py-3 resize-none',
          'bg-[var(--input-bg)] text-[var(--text-primary-c)]',
          'border border-[var(--input-border-color)]',
          'font-sans font-light text-[13px] tracking-[0.01em] leading-relaxed',
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
Textarea.displayName = 'Textarea'

export { Textarea }
