import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl',
              'bg-surface-container-high/95 backdrop-blur-2xl border-t border-white/20 shadow-glass-2',
              'p-4 pb-8 flex flex-col gap-3',
              className
            )}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto mb-1 shrink-0" />

            {title && (
              <div className="flex items-center justify-between px-2 pb-2 border-b border-white/10">
                <h3 className="font-headline-sm text-base text-white font-semibold">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close sheet"
                  className="p-1 rounded-full text-on-surface-variant hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
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
