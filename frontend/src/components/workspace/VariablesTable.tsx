import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Chip } from '@/components/ui/Chip'

interface VariablesTableProps {
  locals: Record<string, unknown>
  mutatedVariable?: string
  className?: string
}

function getTypeBadge(val: unknown): { label: string; color: 'violet' | 'cyan' | 'amber' | 'emerald' | 'gray' } {
  if (val === null || val === undefined) return { label: 'None', color: 'gray' }
  if (typeof val === 'number') return { label: Number.isInteger(val) ? 'int' : 'float', color: 'cyan' }
  if (typeof val === 'string') {
    if (val.startsWith('0x')) return { label: 'ref', color: 'violet' }
    return { label: 'str', color: 'emerald' }
  }
  if (typeof val === 'boolean') return { label: 'bool', color: 'amber' }
  if (Array.isArray(val)) return { label: 'list', color: 'violet' }
  if (typeof val === 'object') return { label: 'dict', color: 'violet' }
  return { label: typeof val, color: 'gray' }
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
    <GlassPanel intensity="low" className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-container-lowest/40">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-cyan">data_object</span>
          <h3 className="text-xs font-semibold text-text-primary tracking-wide uppercase">Variables</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-border-subtle text-text-tertiary">
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
              className="w-24 focus:w-32 transition-all text-xs bg-bg-surface/60 border border-border-subtle rounded-md px-2 py-0.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-cyan/50"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 text-text-tertiary">
            <span className="material-symbols-outlined text-2xl mb-1 opacity-40">hourglass_empty</span>
            <p className="text-xs">No variables in current scope</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {entries.map(([name, value]) => {
                const isMutated = mutatedVariable === name
                const { label, color } = getTypeBadge(value)
                const formatted = formatValue(value)
                const isRef = typeof value === 'string' && value.startsWith('0x')

                return (
                  <motion.div
                    key={name}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${
                      isMutated
                        ? 'bg-amber-400/15 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                        : 'bg-container-lowest/50 border-border-subtle hover:border-border-default'
                    }`}
                  >
                    {/* Var Name + Type */}
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className={`text-xs font-mono font-medium truncate ${isMutated ? 'text-amber-300' : 'text-text-primary'}`}>
                        {name}
                      </span>
                      <Chip variant={color} size="sm" className="font-mono text-[9px] py-0 px-1.5">
                        {label}
                      </Chip>
                    </div>

                    {/* Var Value */}
                    <div className="flex items-center gap-1.5 max-w-[55%]">
                      {isRef && (
                        <span className="material-symbols-outlined text-[13px] text-violet shrink-0">
                          arrow_forward
                        </span>
                      )}
                      <span
                        title={formatted}
                        className={`text-xs font-mono truncate ${
                          isRef
                            ? 'text-violet font-semibold'
                            : isMutated
                            ? 'text-amber-200 font-semibold'
                            : 'text-text-secondary'
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
