import React from 'react'
import { motion } from 'framer-motion'
import { HeapObject } from '@/types/trace'
import { formatCompactItem } from '@/lib/formatters'

interface MemoryBoxProps {
  obj: HeapObject
  referrers?: string[]
  refLabel?: string
  className?: string
}

export const MemoryBox: React.FC<MemoryBoxProps> = ({
  obj,
  referrers = [],
  refLabel,
  className = '',
}) => {
  const isList = obj.type === 'list' && Array.isArray(obj.value)
  const isDict = obj.type === 'dict' && typeof obj.value === 'object' && obj.value !== null && !Array.isArray(obj.value)
  const isSet = obj.type === 'set' && Array.isArray(obj.value)
  const isInstance = obj.type === 'instance' || (typeof obj.value === 'object' && obj.value !== null && (obj.value as any)?.__class__)

  const isShared = referrers.length > 1

  return (
    <motion.div
      layout
      data-testid={`heap-object-${obj.address}`}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
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

      {/* Header: Friendly Ref Label (@1), Type, Label, Muted Address Tag */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          {refLabel && (
            <span className="px-2 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-accent font-mono text-xs font-bold shadow-sm">
              {refLabel}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-glass border border-border text-text-2 font-sans text-[11px] lowercase">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                obj.type === 'list'
                  ? 'bg-syn-function'
                  : obj.type === 'dict'
                  ? 'bg-syn-string'
                  : obj.type === 'set'
                  ? 'bg-syn-number'
                  : 'bg-accent'
              }`}
            />
            {obj.className ? `instance ${obj.className}` : obj.type}
          </span>
          {obj.label && (
            <span className="text-xs font-mono font-medium text-text">
              {obj.label}
            </span>
          )}
        </div>

        {/* Muted mono tag for full hex address with tooltip */}
        <span
          title={`Memory Address: ${obj.address}`}
          className="text-[10px] font-mono text-text-3 bg-glass hover:text-text px-2 py-0.5 rounded-control border border-border cursor-help transition-colors truncate max-w-[8rem]"
        >
          {obj.address}
        </span>
      </div>

      {/* List layout */}
      {isList && (
        <div>
          {(obj.value as unknown[]).length === 0 ? (
            <div className="text-text-3 text-xs font-mono italic py-1 px-1">[ empty list ]</div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar" data-testid="heap-list-cells">
              {(obj.value as unknown[]).map((val, idx) => {
                const isTarget = obj.targetIndex === idx
                return (
                  <motion.div
                    key={idx}
                    layout
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex flex-col items-center min-w-[3rem] px-2.5 py-1.5 rounded-control border transition-colors duration-200 ${
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
                      {formatCompactItem(val)}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Dict layout */}
      {isDict && (
        <div>
          {Object.keys(obj.value as Record<string, unknown>).length === 0 ? (
            <div className="text-text-3 text-xs font-mono italic py-1 px-1">{`{ empty dict }`}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono max-h-48 overflow-y-auto custom-scrollbar" data-testid="heap-dict-cells">
              {Object.entries(obj.value as Record<string, unknown>).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-control bg-glass border border-border"
                >
                  <span className="text-accent font-medium">{JSON.stringify(k)}:</span>
                  <span className="text-text font-normal truncate ml-2">{formatCompactItem(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Set layout */}
      {isSet && (
        <div>
          {(obj.value as unknown[]).length === 0 ? (
            <div className="text-text-3 text-xs font-mono italic py-1 px-1">set() (empty set)</div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar" data-testid="heap-set-cells">
              {(obj.value as unknown[]).map((val, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-control bg-glass border border-border text-xs font-mono text-text"
                >
                  {formatCompactItem(val)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instance layout */}
      {isInstance && (
        <div>
          {(() => {
            const rawFields =
              (obj.value as any)?.fields ||
              (typeof obj.value === 'object' && obj.value !== null && !Array.isArray(obj.value)
                ? obj.value
                : {})
            const entries = Object.entries(rawFields).filter(([k]) => !k.startsWith('__'))

            if (entries.length === 0) {
              return <div className="text-text-3 text-xs font-mono italic py-1 px-1">No instance attributes</div>
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono max-h-48 overflow-y-auto custom-scrollbar" data-testid="heap-instance-fields">
                {entries.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-control bg-glass border border-border"
                  >
                    <span className="text-sage font-medium">{k}:</span>
                    <span className="text-text font-normal truncate ml-2">{formatCompactItem(v)}</span>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}
    </motion.div>
  )
}
