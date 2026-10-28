import React from 'react'
import { motion } from 'framer-motion'
import { HeapObject } from '@/types/trace'
import { Chip } from '@/components/ui/Chip'

interface MemoryBoxProps {
  obj: HeapObject
  className?: string
}

export const MemoryBox: React.FC<MemoryBoxProps> = ({ obj, className = '' }) => {
  const isList = obj.type === 'list' && Array.isArray(obj.value)
  const isDict = obj.type === 'dict' && typeof obj.value === 'object' && !Array.isArray(obj.value)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.88, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -10 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 26,
        mass: 0.8,
      }}
      className={`rounded-xl border border-violet/30 bg-container-lowest/70 backdrop-blur-md p-3.5 shadow-lg shadow-black/20 ${className}`}
    >
      {/* Header: Type, ID, Address */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Chip
            label={obj.type}
            variant="primary"
            active
            className="font-mono text-[9px] uppercase py-0.5 px-2"
          />
          {obj.label && (
            <span className="text-xs font-mono font-medium text-text-primary">
              {obj.label}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-1.5 py-0.5 rounded border border-cyan/20">
          {obj.address}
        </span>
      </div>

      {/* List layout: memory cells */}
      {isList && (
        <div className="flex flex-wrap gap-1.5">
          {(obj.value as unknown[]).map((val, idx) => {
            const isTarget = obj.targetIndex === idx
            return (
              <motion.div
                key={idx}
                layout
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col items-center min-w-[3rem] px-2 py-1.5 rounded-lg border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isTarget
                    ? 'bg-amber-400/20 border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/40'
                    : 'bg-bg-surface/70 border-border-subtle hover:border-border-default'
                }`}
              >
                <span className="text-[9px] font-mono text-text-tertiary">[{idx}]</span>
                <span
                  className={`text-xs font-mono font-bold mt-0.5 ${
                    isTarget ? 'text-amber-300' : 'text-text-primary'
                  }`}
                >
                  {String(val)}
                </span>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Dict layout: key-value pairs */}
      {isDict && (
        <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
          {Object.entries(obj.value as Record<string, unknown>).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-bg-surface/70 border border-border-subtle"
            >
              <span className="text-violet font-medium">{k}:</span>
              <span className="text-text-primary font-bold">{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
