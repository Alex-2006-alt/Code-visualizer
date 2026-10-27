import React, { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delayMs?: number
  className?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delayMs = 200,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef<number | null>(null)

  const showTooltip = () => {
    timerRef.current = window.setTimeout(() => {
      setIsVisible(true)
    }, delayMs)
  }

  const hideTooltip = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }
    setIsVisible(false)
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position]

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 pointer-events-none whitespace-nowrap',
              'px-2.5 py-1 rounded-lg bg-surface-container-highest/95 backdrop-blur-md',
              'border border-white/15 text-white font-code-sm text-[11px] shadow-glass-2',
              positionClasses,
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
