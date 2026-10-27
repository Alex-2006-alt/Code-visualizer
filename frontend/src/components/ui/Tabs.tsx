import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'line' | 'pill'
  className?: string
  children?: React.ReactNode
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  className,
  children,
}) => {
  return (
    <div className={cn('flex flex-col w-full', className)}>
      <div
        role="tablist"
        className={cn(
          'flex items-center gap-1',
          variant === 'line'
            ? 'border-b border-white/[0.08] px-2'
            : 'p-1 rounded-full bg-surface-container-lowest/80 border border-white/5'
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-1.5 font-code-sm text-code-sm transition-colors duration-150 select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-lg',
                variant === 'pill' && 'rounded-full',
                isActive
                  ? 'text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full font-code-sm text-[10px]',
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-surface-container-high text-outline'
                  )}
                >
                  {tab.badge}
                </span>
              )}

              {/* Animated line indicator */}
              {variant === 'line' && isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary shadow-[0_0_8px_#5de6ff]"
                />
              )}

              {/* Animated pill indicator */}
              {variant === 'pill' && isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-surface-container-high text-primary shadow-sm border border-white/10 z-[-1]"
                />
              )}
            </button>
          )
        })}
      </div>

      {children && <div className="mt-2 w-full">{children}</div>}
    </div>
  )
}
