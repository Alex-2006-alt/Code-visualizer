import React from 'react'
import { motion } from 'framer-motion'
import { HeapObject } from '@/types/trace'

interface MemoryBoxProps {
  obj: HeapObject
  referrers?: string[]
  className?: string
}

export const MemoryBox: React.FC<MemoryBoxProps> = ({ obj, referrers = [], className = '' }) => {
  const isList = obj.type === 'list' && Array.isArray(obj.value)
  const isDict = obj.type === 'dict' && typeof obj.value === 'object' && !Array.isArray(obj.value)
  const isShared = referrers.length > 1

  return (
    <motion.div
      layout
      data-testid={`heap-object-${obj.address}`}
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -10 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 26,
        mass: 0.8,
      }}
      className={`rounded-inner border ${
        isShared ? 'border-accent/40' : 'border-border'
      } bg-glass-sunken p-3.5 shadow-panel ${className}`}
    >
      {/* Shared reference notice and pointer arrows */}
      {isShared && (
        <div
          data-testid="shared-reference-badge"
          className="mb-2.5 px-2.5 py-1.5 rounded-control bg-accent-soft border border-accent/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5 text-xs font-mono text-accent font-medium">
            <span className="material-symbols-outlined text-xs">link</span>
            <span>Shared: {referrers.join(' = ')}</span>
          </div>
          <div className="flex items-center gap-1.5" data-testid="shared-reference-arrows">
            {referrers.map((refName) => (
              <span
                key={refName}
                data-testid={`ref-arrow-${refName}`}
                className="px-1.5 py-0.5 rounded-control bg-glass border border-border text-[10px] font-mono text-accent flex items-center gap-0.5"
              >
                <span>{refName}</span>
                <span>&rarr;</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Header: Type, ID, Address */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-glass border border-border text-text-2 font-sans text-[11px] lowercase">
            <span className={`w-1.5 h-1.5 rounded-full ${obj.type === 'list' ? 'bg-syn-function' : 'bg-syn-string'}`} />
            {obj.type}
          </span>
          {obj.label && (
            <span className="text-xs font-mono font-medium text-text">
              {obj.label}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-accent bg-glass px-1.5 py-0.5 rounded-control border border-border">
          {obj.address}
        </span>
      </div>

      {/* List layout: memory cells */}
      {isList && (
        <div className="flex flex-wrap gap-1.5" data-testid="heap-list-cells">
          {(obj.value as unknown[]).map((val, idx) => {
            const isTarget = obj.targetIndex === idx
            return (
              <motion.div
                key={idx}
                layout
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col items-center min-w-[3rem] px-2 py-1.5 rounded-control border transition-colors duration-200 ${
                  isTarget
                    ? 'bg-sage-soft border-sage/60 text-sage'
                    : 'bg-glass border-border hover:border-border-strong text-text'
                }`}
              >
                <span className="text-[9px] font-mono text-text-3">[{idx}]</span>
                <span
                  className={`text-xs font-mono font-medium mt-0.5 ${
                    isTarget ? 'text-sage' : 'text-text'
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
        <div className="grid grid-cols-2 gap-1.5 text-xs font-mono" data-testid="heap-dict-cells">
          {Object.entries(obj.value as Record<string, unknown>).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-control bg-glass border border-border"
            >
              <span className="text-accent font-medium">{k}:</span>
              <span className="text-text font-normal">{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
