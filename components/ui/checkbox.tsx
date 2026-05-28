'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-[1px]',
      'border border-[rgba(201,168,76,0.3)] bg-dynasty-black-soft',
      'transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dynasty-gold/40',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-dynasty-gold data-[state=checked]:border-dynasty-gold',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-dynasty-black">
      <Check className="h-3 w-3" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
