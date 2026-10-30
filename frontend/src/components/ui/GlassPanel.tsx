import React from 'react'
import { cn } from '@/lib/utils'

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3
  glow?: 'none' | 'primary' | 'secondary' | 'cyan' | 'amber' | 'error'
  solid?: boolean
  as?: React.ElementType
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  (
    {
      level = 1,
      glow = 'none',
      solid = false,
      as: Component = 'div',
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Midnight Blue & Sage Glass Layering Hierarchy
    const levelClasses = solid
      ? {
          1: 'bg-[#12151D] border border-border shadow-panel rounded-panel',
          2: 'bg-[#08090B] border border-border rounded-inner',
          3: 'bg-[#151922] border border-border-strong shadow-float rounded-panel',
        }[level]
      : {
          1: 'glass-panel',
          2: 'glass-panel-sunken',
          3: 'glass-panel-raised',
        }[level]

    // Restrained hairline highlight - never colorful neon glow
    const glowClasses = {
      none: '',
      primary: 'border-accent/40',
      secondary: 'border-sage/40',
      cyan: 'border-accent/40',
      amber: 'border-sage/40',
      error: 'border-error/40',
    }[glow]

    return (
      <Component
        ref={ref}
        className={cn(
          'relative transition-all duration-200',
          levelClasses,
          glowClasses,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

GlassPanel.displayName = 'GlassPanel'
