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
      glow = false,
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
    const variantClasses = {
      primary:
        'bg-primary-container text-on-primary-container hover:brightness-110 active:bg-inverse-primary shadow-[0_0_16px_rgba(148,125,255,0.35)] hover:shadow-[0_0_24px_rgba(148,125,255,0.6)] border border-primary/30',
      secondary:
        'bg-surface-container-high/80 text-on-surface hover:bg-surface-bright hover:text-white border border-white/10 shadow-sm hover:shadow-[0_0_12px_rgba(255,255,255,0.12)]',
      ghost:
        'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 border border-transparent hover:border-white/5',
      danger:
        'bg-error-container/30 text-error hover:bg-error-container/50 border border-error/40 shadow-[0_0_12px_rgba(255,180,171,0.25)]',
    }[variant]

    const sizeClasses = {
      sm: 'h-7 px-3 text-code-sm gap-1.5 rounded-full',
      md: 'h-9 px-4 text-body-sm font-medium gap-2 rounded-full',
      lg: 'h-11 px-6 text-headline-sm gap-2.5 rounded-full',
      icon: 'w-9 h-9 p-0 rounded-full items-center justify-center',
    }[size]

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-sans tracking-wide transition-all duration-150 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          'active:scale-[0.97]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none',
          glow && 'shadow-glow-primary',
          variantClasses,
          sizeClasses,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
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
