import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { TraceStep } from '@/types/trace'

interface EventLogDrawerProps {
  isOpen: boolean
  onClose: () => void
  steps: TraceStep[]
  currentStep: number
  onSelectStep: (stepIndex: number) => void
}

export const EventLogDrawer: React.FC<EventLogDrawerProps> = ({
  isOpen,
  onClose,
  steps,
  currentStep,
  onSelectStep,
}) => {
  const [search, setSearch] = useState('')

  const filteredSteps = useMemo(() => {
    if (!search.trim()) {
      return steps.map((step, index) => ({ step, index }))
    }
    const q = search.toLowerCase()
    return steps
      .map((step, index) => ({ step, index }))
      .filter(({ step, index }) => {
        const matchesIndex = (index + 1).toString().includes(q)
        const matchesLine = step.line.toString().includes(q)
        const matchesEvent = step.event.toLowerCase().includes(q)
        const matchesMutated = step.mutatedVariable?.toLowerCase().includes(q)
        const matchesExpl = step.explanation?.toLowerCase().includes(q)
        return (
          matchesIndex ||
          matchesLine ||
          matchesEvent ||
          Boolean(matchesMutated) ||
          Boolean(matchesExpl)
        )
      })
  }, [steps, search])

  const getEventBadge = (event: string) => {
    switch (event) {
      case 'call':
        return 'bg-accent/20 text-accent border-accent/40'
      case 'return':
        return 'bg-sage/20 text-sage border-sage/40'
      case 'exception':
        return 'bg-error/20 text-error border-error/40'
      default:
        return 'bg-glass-sunken text-text-3 border-border'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          {/* Backdrop Click */}
          <div className="flex-1" onClick={onClose} />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-md h-full bg-bg border-l border-border shadow-float flex flex-col z-10"
            data-testid="event-log-drawer"
          >
            {/* Header */}
            <div className="p-4 bg-glass-sunken border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent text-lg">list_alt</span>
                <h3 className="font-serif text-xl text-text font-normal">Execution Event Log</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-glass border border-border text-text-3">
                  {steps.length} steps
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-control bg-glass border border-border text-text-2 hover:text-text flex items-center justify-center cursor-pointer"
                aria-label="Close event log"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-border bg-panel-body">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-3 text-base">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by line #, event, or variable name..."
                  data-testid="event-log-search"
                  className="w-full pl-9 pr-3 py-1.5 rounded-control bg-glass-sunken border border-border text-xs text-text placeholder:text-text-3 font-mono focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-panel-body">
              {filteredSteps.length === 0 ? (
                <div className="p-8 text-center text-text-3 font-sans text-xs">
                  No matching steps found for &quot;{search}&quot;.
                </div>
              ) : (
                filteredSteps.map(({ step, index }) => {
                  const isActive = index === currentStep
                  return (
                    <GlassPanel
                      key={index}
                      level={1}
                      onClick={() => onSelectStep(index)}
                      data-testid={`event-log-item-${index}`}
                      className={`p-3 rounded-inner border cursor-pointer transition-all flex flex-col gap-1.5 ${
                        isActive
                          ? 'border-accent bg-accent/10 shadow-panel'
                          : 'border-border hover:border-border-strong hover:bg-glass-raised'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isActive ? 'text-accent' : 'text-text-3'
                            }`}
                          >
                            Step {index + 1}
                          </span>
                          <span className="text-text-3">•</span>
                          <span className="text-text">Ln {step.line}</span>
                        </div>

                        <span
                          className={`px-1.5 py-0.2 rounded border uppercase text-[10px] font-semibold tracking-wider ${getEventBadge(
                            step.event
                          )}`}
                        >
                          {step.event}
                        </span>
                      </div>

                      {/* Detail row */}
                      <div className="text-[11px] font-mono text-text-2 truncate">
                        {step.mutatedVariable ? (
                          <span>
                            <span className="text-text-3">Mutated: </span>
                            <span className="text-accent">{step.mutatedVariable}</span>
                          </span>
                        ) : step.ret !== undefined ? (
                          <span>
                            <span className="text-text-3">Return: </span>
                            <span className="text-sage">{String(step.ret)}</span>
                          </span>
                        ) : step.explanation ? (
                          <span className="text-text-3">{step.explanation}</span>
                        ) : (
                          <span className="text-text-3">Line execution</span>
                        )}
                      </div>
                    </GlassPanel>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

