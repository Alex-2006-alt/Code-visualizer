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
            ? 'border-b border-border px-2'
            : 'p-1 rounded-inner bg-glass-sunken border border-border'
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
                'relative flex items-center gap-1.5 px-3 py-1.5 font-sans text-xs transition-colors duration-150 select-none cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-control',
                isActive
                  ? variant === 'line'
                    ? 'text-text font-medium'
                    : 'text-accent font-medium'
                  : 'text-text-2 hover:text-text hover:bg-glass'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full font-mono text-[10px]',
                    isActive
                      ? 'bg-accent-soft text-accent border border-accent/20'
                      : 'bg-glass-sunken text-text-3'
                  )}
                >
                  {tab.badge}
                </span>
              )}

              {/* Animated 2px accent underline */}
              {variant === 'line' && isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}

              {/* Animated glass-raised pill fill */}
              {variant === 'pill' && isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-control bg-glass-raised border border-border-strong shadow-panel z-[-1]"
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
