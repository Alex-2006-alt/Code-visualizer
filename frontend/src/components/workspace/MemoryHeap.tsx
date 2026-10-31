import React, { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { HeapObject } from '@/types/trace'
import { MemoryBox } from './MemoryBox'

interface MemoryHeapProps {
  objects?: HeapObject[]
  locals?: Record<string, unknown>
  addressLabels?: Map<string, string>
  className?: string
}

const VALID_HEAP_TYPES = new Set(['list', 'dict', 'set', 'instance'])

export const MemoryHeap: React.FC<MemoryHeapProps> = ({
  objects = [],
  locals = {},
  addressLabels,
  className = '',
}) => {
  // Only container or mutable objects that variables point to (lists, dicts, sets, instances)
  const filteredObjects = useMemo(() => {
    return objects.filter((obj) => VALID_HEAP_TYPES.has(obj.type))
  }, [objects])

  const getReferrersForAddress = (addr: string): string[] => {
    return Object.entries(locals)
      .filter(([_, val]) => typeof val === 'string' && val.toLowerCase() === addr.toLowerCase())
      .map(([name]) => name)
  }

  return (
    <GlassPanel level={2} data-testid="virtual-heap" className={`flex flex-col h-full border border-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-glass-sunken">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-accent">memory</span>
          <h3 className="text-[11px] font-sans font-medium text-text-3 tracking-[0.08em] uppercase">Virtual Heap</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-glass border border-border text-text-3">
            {filteredObjects.length} {filteredObjects.length === 1 ? 'object' : 'objects'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-text-3 font-mono">
          <span className="w-2 h-2 rounded-full bg-accent/60" />
          <span>HEAP_ADDR_SPACE</span>
        </div>
      </div>

      {/* Heap Memory Grid with Flat Solid Fill and Smooth Scrolling */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-panel-body">
        {filteredObjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 text-text-2">
            <span className="material-symbols-outlined text-2xl mb-1 text-text-3">grid_off</span>
            <p className="text-xs">No reference objects currently on heap</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredObjects.map((obj) => {
              const lower = obj.address.toLowerCase()
              const refLabel = addressLabels?.get(lower)
              return (
                <MemoryBox
                  key={obj.id}
                  obj={obj}
                  refLabel={refLabel}
                  referrers={getReferrersForAddress(obj.address)}
                />
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </GlassPanel>
  )
}
