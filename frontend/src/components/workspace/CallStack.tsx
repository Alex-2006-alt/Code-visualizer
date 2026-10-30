import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Frame } from '@/types/trace'
import { StackFrameCard } from './StackFrameCard'

interface CallStackProps {
  stack: Frame[]
  event?: 'line' | 'call' | 'return' | 'exception'
  className?: string
  onSelectFrame?: (index: number) => void
}

export const CallStack: React.FC<CallStackProps> = ({
  stack,
  event = 'line',
  className = '',
  onSelectFrame,
}) => {
  const framesReversed = [...stack].reverse()

  return (
    <GlassPanel level={2} className={`flex flex-col h-full border border-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-glass-sunken">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-accent">layers</span>
          <h3 className="text-[11px] font-sans font-medium text-text-3 tracking-[0.08em] uppercase">Call Stack</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-glass border border-border text-text-3">
            Depth {stack.length}
          </span>
        </div>

        {event && (
          <span className="px-2 py-0.5 rounded-full bg-glass border border-border text-accent font-mono text-[10px] uppercase">
            {event}
          </span>
        )}
      </div>

      {/* Frame List with Flat Solid Fill for Crisp Contrast */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-panel-body">
        {stack.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 text-text-2">
            <span className="material-symbols-outlined text-2xl mb-1 text-text-3">layers_clear</span>
            <p className="text-xs">Execution finished or inactive</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {framesReversed.map((frame, index) => {
              const originalIndex = stack.length - 1 - index
              const isTop = index === 0

              return (
                <StackFrameCard
                  key={`${frame.fn}-${originalIndex}`}
                  frame={frame}
                  depth={originalIndex}
                  isTop={isTop}
                  onClick={() => onSelectFrame?.(originalIndex)}
                />
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </GlassPanel>
  )
}
