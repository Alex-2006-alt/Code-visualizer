import React from 'react'
import { cn } from '@/lib/utils'

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3
  glow?: 'none' | 'primary' | 'secondary' | 'cyan' | 'amber' | 'error'
  as?: React.ElementType
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  (
    {
      level = 1,
      glow = 'none',
      as: Component = 'div',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const levelClasses = {
      1: 'glass-panel-1 bg-surface-container/60 backdrop-blur-xl border border-white/10 shadow-glass-1',
      2: 'glass-panel-2 bg-surface-container-lowest/85 backdrop-blur-md border border-white/[0.08]',
      3: 'glass-panel-3 bg-surface-container-high/90 backdrop-blur-2xl border border-white/20 shadow-glass-2',
    }[level]

    const glowClasses = {
      none: '',
      primary: 'shadow-glow-primary border-primary/30',
      secondary: 'shadow-glow-secondary border-secondary/30',
      cyan: 'shadow-glow-cyan border-secondary/40',
      amber: 'shadow-glow-amber border-amber-mutation/40',
      error: 'shadow-glow-error border-error/40',
    }[glow]

    return (
      <Component
        ref={ref}
        className={cn(
          'relative rounded-xl transition-all duration-200',
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
