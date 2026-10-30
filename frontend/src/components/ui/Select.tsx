import React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center">
        <select
          ref={ref}
          className={cn(
            'appearance-none bg-glass-sunken hover:bg-glass border border-border hover:border-border-strong',
            'rounded-control px-3 py-1.5 pr-8 text-xs font-sans text-text transition-colors duration-150 cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {/* Hairline chevron */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 text-text-3 material-symbols-outlined text-[16px]"
        >
          expand_more
        </span>
      </div>
    )
  }
)

Select.displayName = 'Select'
