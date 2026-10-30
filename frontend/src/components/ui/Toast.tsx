import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useToastStore } from './toastStore'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  const typeConfig = {
    info: {
      icon: 'info',
      iconClass: 'text-info bg-accent-soft',
      badgeClass: 'text-info',
    },
    warning: {
      icon: 'warning',
      iconClass: 'text-accent bg-accent-soft',
      badgeClass: 'text-accent',
    },
    error: {
      icon: 'error',
      iconClass: 'text-error bg-error/15',
      badgeClass: 'text-error',
    },
    success: {
      icon: 'check_circle',
      iconClass: 'text-success bg-sage-soft',
      badgeClass: 'text-success',
    },
  }

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const config = typeConfig[t.type]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'pointer-events-auto p-4 rounded-panel bg-glass-raised backdrop-blur-xl border border-border-strong shadow-float',
                'flex flex-col gap-2'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                    config.iconClass
                  )}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {config.icon}
                  </span>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-sans text-sm text-text font-medium">
                    {t.title}
                  </span>
                  {t.description && (
                    <span className="font-sans text-xs text-text-2 mt-0.5 leading-relaxed">
                      {t.description}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  aria-label="Close notification"
                  className="text-text-3 hover:text-text p-1 rounded-control hover:bg-glass transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              {t.actionLabel && (
                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      t.onAction?.()
                      removeToast(t.id)
                    }}
                    className={cn(
                      'px-3 py-1 rounded-control font-sans text-xs transition-colors cursor-pointer',
                      'bg-glass hover:bg-glass-raised border border-border hover:border-border-strong',
                      config.badgeClass
                    )}
                  >
                    {t.actionLabel}
                  </button>
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
