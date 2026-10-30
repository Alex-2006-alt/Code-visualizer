import React from 'react'
import { cn } from '@/lib/utils'

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  count?: number | string
  active?: boolean
  variant?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'error'
  icon?: React.ReactNode
}

export const Chip: React.FC<ChipProps> = ({
  label,
  count,
  active = false,
  variant = 'default',
  icon,
  className,
  disabled,
  onClick,
  ...props
}) => {
  const variantActiveStyles = {
    default: 'bg-glass-raised text-text border-border-strong shadow-panel',
    primary: 'bg-accent-soft text-accent border-accent/40',
    secondary: 'bg-sage-soft text-sage border-sage/40',
    tertiary: 'bg-glass-raised text-text border-border-strong',
    error: 'bg-error/15 text-error border-error/30',
  }[variant]

  const variantInactiveStyles =
    'bg-glass text-text-2 hover:text-text hover:bg-glass-raised border-border'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-sans text-[11px] tracking-normal',
        'border transition-colors duration-150 select-none whitespace-nowrap cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
        'active:scale-95',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        active ? variantActiveStyles : variantInactiveStyles,
        className
      )}
      {...props}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'px-1.5 py-0.2 rounded-full font-mono text-[10px] ml-0.5',
            active ? 'bg-glass-sunken text-current' : 'text-text-3 bg-glass-sunken'
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}
