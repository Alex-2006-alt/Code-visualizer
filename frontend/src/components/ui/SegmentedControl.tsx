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
        'inline-flex items-center p-0.5 rounded-full bg-glass-sunken border border-border backdrop-blur-xl relative',
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
              'relative z-10 inline-flex items-center justify-center font-sans transition-colors duration-150 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
              size === 'sm'
                ? 'px-3 py-1 text-xs font-normal gap-1'
                : 'px-4 py-1.5 text-sm font-normal gap-1.5',
              isSelected
                ? 'text-accent font-medium'
                : 'text-text-2 hover:text-text'
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
                className="absolute inset-0 rounded-full bg-glass-raised border border-border-strong shadow-panel z-[-1]"
              />
            )}
            {option.icon && (
              <span className="shrink-0 flex items-center justify-center">
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-glass-sunken text-text-3">
                {option.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
