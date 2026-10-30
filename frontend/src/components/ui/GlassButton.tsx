import React from 'react'
import { cn } from '@/lib/utils'

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  glow?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      glow: _glow = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Midnight Blue & Sage Button Hierarchy
    const variantClasses = {
      primary:
        'bg-accent text-on-accent font-medium hover:bg-accent-hover active:bg-accent-press border border-accent/20',
      secondary:
        'bg-glass hover:bg-glass-raised text-text border border-border hover:border-border-strong',
      ghost:
        'bg-transparent text-text-2 hover:text-text hover:bg-glass border border-transparent',
      danger:
        'bg-error/15 text-error hover:bg-error/25 active:bg-error/30 border border-error/30',
    }[variant]

    const sizeClasses = {
      sm: 'h-7 px-3 text-xs gap-1.5 rounded-control',
      md: 'h-9 px-4 text-sm font-medium gap-2 rounded-control',
      lg: 'h-11 px-6 text-base font-medium gap-2.5 rounded-control',
      icon: 'w-9 h-9 p-0 rounded-control items-center justify-center',
    }[size]

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-sans tracking-tight transition-colors duration-150 select-none cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          'active:scale-[0.98]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none',
          variantClasses,
          sizeClasses,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
            aria-hidden="true"
          />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

GlassButton.displayName = 'GlassButton'
