import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'

interface VariablesTableProps {
  locals: Record<string, unknown>
  mutatedVariable?: string
  className?: string
}

function getTypeBadge(val: unknown): { label: string; dotClass: string } {
  if (val === null || val === undefined) return { label: 'none', dotClass: 'bg-text-3' }
  if (typeof val === 'number') return { label: Number.isInteger(val) ? 'int' : 'float', dotClass: 'bg-syn-number' }
  if (typeof val === 'string') {
    if (val.startsWith('0x')) return { label: 'ref', dotClass: 'bg-accent' }
    return { label: 'str', dotClass: 'bg-syn-keyword' }
  }
  if (typeof val === 'boolean') return { label: 'bool', dotClass: 'bg-syn-number' }
  if (Array.isArray(val)) return { label: 'list', dotClass: 'bg-syn-function' }
  if (typeof val === 'object') return { label: 'dict', dotClass: 'bg-syn-string' }
  return { label: typeof val, dotClass: 'bg-text-3' }
}

function formatValue(val: unknown): string {
  if (val === null) return 'None'
  if (val === undefined) return 'undefined'
  if (typeof val === 'string') {
    if (val.startsWith('0x')) return val
    return `"${val}"`
  }
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val)
    } catch {
      return String(val)
    }
  }
  return String(val)
}

export const VariablesTable: React.FC<VariablesTableProps> = ({
  locals,
  mutatedVariable,
  className = '',
}) => {
  const [filter, setFilter] = useState('')

  const entries = useMemo(() => {
    const all = Object.entries(locals)
    if (!filter.trim()) return all
    return all.filter(([key]) => key.toLowerCase().includes(filter.toLowerCase()))
  }, [locals, filter])

  return (
    <GlassPanel level={2} className={`flex flex-col h-full border border-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-glass-sunken">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-accent">data_object</span>
          <h3 className="text-[11px] font-sans font-medium text-text-3 tracking-[0.08em] uppercase">Variables</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-glass border border-border text-text-3">
            {Object.keys(locals).length}
          </span>
        </div>

        {Object.keys(locals).length > 3 && (
          <div className="relative">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter..."
              className="w-24 focus:w-32 transition-all duration-200 text-xs bg-glass-sunken border border-border rounded-control px-2 py-0.5 text-text placeholder:text-text-3 focus:outline-none focus:border-accent"
            />
          </div>
        )}
      </div>

      {/* Content Area with Flat Solid Fill for Crisp Contrast */}
      <div data-testid="variables-content" className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-panel-body">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 text-text-2">
            <span className="material-symbols-outlined text-2xl mb-1 text-text-3">hourglass_empty</span>
            <p className="text-xs">No variables in current scope</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {entries.map(([name, value]) => {
                const isMutated = mutatedVariable === name
                const { label, dotClass } = getTypeBadge(value)
                const formatted = formatValue(value)
                const isRef = typeof value === 'string' && value.startsWith('0x')

                return (
                  <motion.div
                    key={`${name}-${formatted}-${isMutated}`}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex items-center justify-between px-3 py-2 rounded-inner border transition-colors duration-200 ${
                      isMutated
                        ? 'animate-changed-flash border-sage/50'
                        : 'bg-glass border-border hover:border-border-strong'
                    }`}
                  >
                    {/* Var Name + Clean Neutral Glass Type Badge with Dot */}
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className={`text-xs font-mono font-medium truncate ${isMutated ? 'text-sage' : 'text-text'}`}>
                        {name}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-glass border border-border text-text-2 font-sans text-[11px] lowercase">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                        {label}
                      </span>
                    </div>

                    {/* Var Value */}
                    <div className="flex items-center gap-1.5 max-w-[55%]">
                      {isRef && (
                        <span className="material-symbols-outlined text-[13px] text-accent shrink-0">
                          arrow_forward
                        </span>
                      )}
                      <span
                        title={formatted}
                        className={`text-xs font-mono truncate ${
                          isRef
                            ? 'text-accent font-medium'
                            : isMutated
                            ? 'text-sage font-medium'
                            : 'text-text-2'
                        }`}
                      >
                        {formatted}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </GlassPanel>
  )
}
