import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { HeapObject } from '@/types/trace'
import { MemoryBox } from './MemoryBox'

interface MemoryHeapProps {
  objects?: HeapObject[]
  locals?: Record<string, unknown>
  className?: string
}

export const MemoryHeap: React.FC<MemoryHeapProps> = ({
  objects = [],
  locals = {},
  className = '',
}) => {
  const getReferrersForAddress = (addr: string): string[] => {
    return Object.entries(locals)
      .filter(([_, val]) => typeof val === 'string' && val.toLowerCase() === addr.toLowerCase())
      .map(([name]) => name)
  }

  return (
    <GlassPanel level={1} className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-container-lowest/40">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-cyan">memory</span>
          <h3 className="text-xs font-semibold text-text-primary tracking-wide uppercase">Virtual Heap</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-border-subtle text-text-tertiary">
            {objects.length} {objects.length === 1 ? 'object' : 'objects'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan/60 animate-pulse" />
          <span>HEAP_ADDR_SPACE</span>
        </div>
      </div>

      {/* Heap Memory Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {objects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 text-text-tertiary">
            <span className="material-symbols-outlined text-2xl mb-1 opacity-40">grid_off</span>
            <p className="text-xs">No reference objects currently on heap</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {objects.map((obj) => (
              <MemoryBox
                key={obj.id}
                obj={obj}
                referrers={getReferrersForAddress(obj.address)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </GlassPanel>
  )
}
