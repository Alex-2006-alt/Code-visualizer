import React from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  glow?: boolean
  disabled?: boolean
  label?: string
  formatValue?: (val: number) => string
  className?: string
  ariaLabel?: string
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  glow: _glow = false,
  disabled = false,
  label,
  formatValue,
  className,
  ariaLabel = 'Progress slider',
}) => {
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min || 1)) * 100)
  )

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  return (
    <div className={cn('flex flex-col gap-1 w-full select-none', className)}>
      {label && (
        <div className="flex items-center justify-between font-sans text-xs text-text-3">
          <span>{label}</span>
          <span className="text-accent font-mono font-medium">
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      )}

      <div className="relative flex items-center h-5 w-full group">
        {/* Track Background */}
        <div className="w-full h-1.5 rounded-full bg-glass-sunken border border-border/40 overflow-hidden relative">
          {/* Active Fill Track */}
          <div
            className="h-full bg-accent rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Real Native Range Input for Perfect Touch/Mouse/Keyboard a11y */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handleSliderChange}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          className={cn(
            'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
            'focus-visible:outline-none focus-visible:opacity-100 focus-visible:accent-accent',
            'disabled:cursor-not-allowed'
          )}
        />

        {/* Restrained Thumb Marker */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute w-3.5 h-3.5 -ml-1.5 rounded-full bg-text border-2 border-accent shadow-panel',
            'transition-transform group-hover:scale-110 duration-150',
            disabled && 'opacity-40'
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
