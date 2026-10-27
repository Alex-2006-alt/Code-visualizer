import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  name?: string
  size?: 'sm' | 'md'
  className?: string
  layoutId?: string
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  layoutId = 'segmented-indicator',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'inline-flex items-center p-1 rounded-full bg-surface-container-lowest/90 border border-white/[0.08] backdrop-blur-xl shadow-inner relative',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 inline-flex items-center justify-center font-sans transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
              size === 'sm'
                ? 'px-2.5 py-1 text-code-sm font-medium gap-1'
                : 'px-3.5 py-1.5 text-body-sm font-medium gap-1.5',
              isSelected ? 'text-on-primary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 35,
                }}
                className="absolute inset-0 rounded-full bg-primary-container shadow-[0_0_16px_rgba(148,125,255,0.4)] border border-primary/30 z-[-1]"
              />
            )}
            {option.icon && (
              <span className="shrink-0 flex items-center justify-center">
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full font-code-sm text-[10px] bg-black/20">
                {option.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
