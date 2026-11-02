import React, { useState, useMemo, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { HeapObject } from '@/types/trace'
import { MemoryBox } from './MemoryBox'
import { DataStructureGraph } from './DataStructureGraph'
import { classifyHeapGraph } from '@/lib/heapGraphClassifier'
import { FEATURES } from '@/config/features'

interface MemoryHeapProps {
  objects?: HeapObject[]
  locals?: Record<string, unknown>
  addressLabels?: Map<string, string>
  mutatedVariable?: string
  className?: string
}

const VALID_HEAP_TYPES = new Set(['list', 'dict', 'set', 'instance'])

export const MemoryHeap: React.FC<MemoryHeapProps> = ({
  objects = [],
  locals = {},
  addressLabels,
  mutatedVariable,
  className = '',
}) => {
  // Only container or mutable objects that variables point to (lists, dicts, sets, instances)
  const filteredObjects = useMemo(() => {
    return objects.filter((obj) => VALID_HEAP_TYPES.has(obj.type))
  }, [objects])

  // Classify heap object graph for semantic data structures
  const classifiedGraph = useMemo(() => {
    if (!FEATURES.STRUCTURE_VISUALIZATION) {
      return { kind: 'none' as const, title: '', nodes: [], edges: [], rootIds: [], hasCycle: false }
    }
    return classifyHeapGraph(filteredObjects, locals)
  }, [filteredObjects, locals])

  // View mode: 'graph' or 'boxes'
  const isGraphEligible = classifiedGraph.kind !== 'none'
  const [viewMode, setViewMode] = useState<'graph' | 'boxes'>('boxes')

  // Automatically default to graph view when a structure is detected
  useEffect(() => {
    if (isGraphEligible) {
      setViewMode('graph')
    }
  }, [isGraphEligible])

  const getReferrersForAddress = (addr: string): string[] => {
    return Object.entries(locals)
      .filter(([_, val]) => typeof val === 'string' && val.toLowerCase() === addr.toLowerCase())
      .map(([name]) => name)
  }

  return (
    <GlassPanel
      level={2}
      data-testid="virtual-heap"
      className={`flex flex-col h-full border border-border overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-glass-sunken">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-accent">
            {isGraphEligible && viewMode === 'graph' ? 'account_tree' : 'memory'}
          </span>
          <h3 className="text-[11px] font-sans font-medium text-text-3 tracking-[0.08em] uppercase">
            {isGraphEligible && viewMode === 'graph' ? classifiedGraph.title : 'Virtual Heap'}
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-glass border border-border text-text-3">
            {filteredObjects.length} {filteredObjects.length === 1 ? 'object' : 'objects'}
          </span>
        </div>

        {/* View Switcher: Graph vs Boxes */}
        <div className="flex items-center gap-2">
          {isGraphEligible && (
            <div
              className="flex items-center gap-0.5 bg-glass-sunken p-0.5 rounded-control border border-border text-[10px] font-mono"
              data-testid="heap-view-toggle"
            >
              <button
                type="button"
                onClick={() => setViewMode('graph')}
                className={`px-2 py-0.5 rounded-control transition-colors cursor-pointer ${
                  viewMode === 'graph'
                    ? 'bg-glass-raised text-accent font-medium border border-border-strong'
                    : 'text-text-3 hover:text-text'
                }`}
                data-testid="btn-view-graph"
              >
                Graph
              </button>
              <button
                type="button"
                onClick={() => setViewMode('boxes')}
                className={`px-2 py-0.5 rounded-control transition-colors cursor-pointer ${
                  viewMode === 'boxes'
                    ? 'bg-glass-raised text-accent font-medium border border-border-strong'
                    : 'text-text-3 hover:text-text'
                }`}
                data-testid="btn-view-boxes"
              >
                Boxes
              </button>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-text-3 font-mono">
            <span className="w-2 h-2 rounded-full bg-accent/60" />
            <span>HEAP_ADDR_SPACE</span>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'graph' && isGraphEligible ? (
        <div className="flex-1 w-full h-full min-h-[220px] overflow-hidden" data-testid="graph-view-container">
          <DataStructureGraph
            graph={classifiedGraph}
            addressLabels={addressLabels}
            mutatedVariable={mutatedVariable}
          />
        </div>
      ) : (
        /* Heap Memory Box View */
        <div
          className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-panel-body"
          data-testid="boxes-view-container"
        >
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
      )}
    </GlassPanel>
  )
}
