import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-desc' : undefined}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={cn(
              'relative w-full rounded-2xl bg-surface-container-high/95 backdrop-blur-2xl',
              'border border-white/20 shadow-glass-2 p-6 z-10 flex flex-col gap-4',
              sizeClasses,
              className
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col">
                  {title && (
                    <h3
                      id="modal-title"
                      className="font-headline-lg text-lg sm:text-xl text-white font-semibold tracking-tight"
                    >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p
                      id="modal-desc"
                      className="font-body-sm text-on-surface-variant text-sm mt-1"
                    >
                      {description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-1 rounded-full text-on-surface-variant hover:text-white hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            )}

            <div className="w-full">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
