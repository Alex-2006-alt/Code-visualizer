import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useToastStore } from './toastStore'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  const typeConfig = {
    info: {
      icon: 'info',
      iconClass: 'text-primary bg-primary/20',
      badgeClass: 'text-primary',
    },
    warning: {
      icon: 'warning',
      iconClass: 'text-tertiary bg-surface-container-highest',
      badgeClass: 'text-tertiary',
    },
    error: {
      icon: 'timer',
      iconClass: 'text-error bg-error-container/40',
      badgeClass: 'text-error',
    },
    success: {
      icon: 'check_circle',
      iconClass: 'text-secondary bg-secondary-container/20',
      badgeClass: 'text-secondary',
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
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pointer-events-auto p-4 rounded-xl bg-surface-container-high/95 backdrop-blur-2xl border border-white/20 shadow-glass-2',
                'flex flex-col gap-2'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    config.iconClass
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {config.icon}
                  </span>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-headline-sm text-sm text-on-surface font-semibold">
                    {t.title}
                  </span>
                  {t.description && (
                    <span className="font-body-sm text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      {t.description}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  aria-label="Close notification"
                  className="text-on-surface-variant hover:text-white p-1 rounded-full hover:bg-surface-container-highest transition-colors"
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
                      'px-3 py-1 rounded-full font-label-caps text-label-caps uppercase transition-colors',
                      'bg-surface-container-highest hover:bg-surface-bright',
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
