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
  glow = true,
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
        <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant">
          <span>{label}</span>
          <span className="text-secondary font-medium">
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      )}

      <div className="relative flex items-center h-5 w-full group">
        {/* Track Background */}
        <div className="w-full h-1.5 rounded-full bg-surface-container-high/90 overflow-hidden relative">
          {/* Active Fill Track */}
          <div
            className={cn(
              'h-full bg-secondary rounded-full transition-all duration-75',
              glow && 'shadow-[0_0_12px_rgba(93,230,255,0.7)]'
            )}
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
            'focus-visible:outline-none focus-visible:opacity-100 focus-visible:accent-secondary',
            'disabled:cursor-not-allowed'
          )}
        />

        {/* Custom Glowing Thumb Marker */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute w-3.5 h-3.5 -ml-1.5 rounded-full bg-white border-2 border-secondary shadow-[0_0_10px_#5de6ff]',
            'transition-transform group-hover:scale-125 duration-150',
            disabled && 'opacity-40'
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
