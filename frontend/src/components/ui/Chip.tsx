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
    default: 'bg-surface-container-highest text-white border-white/20 shadow-sm',
    primary:
      'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(148,125,255,0.4)] border-primary/40',
    secondary:
      'bg-secondary-container text-on-secondary-container shadow-[0_0_12px_rgba(0,203,230,0.35)] border-secondary/40',
    tertiary:
      'bg-tertiary-container/40 text-tertiary shadow-[0_0_12px_rgba(209,100,226,0.3)] border-tertiary/40',
    error:
      'bg-error-container/40 text-error shadow-[0_0_12px_rgba(255,180,171,0.3)] border-error/40',
  }[variant]

  const variantInactiveStyles =
    'bg-surface-container/70 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border-white/5'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-label-caps uppercase tracking-wider',
        'border transition-all duration-150 select-none whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
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
            'px-1.5 py-0.2 rounded font-code-sm text-[10px] ml-0.5',
            active ? 'bg-black/20 text-current' : 'text-outline bg-surface-container-high/60'
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}
