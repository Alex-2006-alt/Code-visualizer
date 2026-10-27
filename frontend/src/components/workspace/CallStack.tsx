import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Chip } from '@/components/ui/Chip'
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
  // Top of stack is the last frame
  const framesReversed = [...stack].reverse()

  const eventVariantMap: Record<string, 'cyan' | 'violet' | 'amber' | 'coral'> = {
    line: 'cyan',
    call: 'violet',
    return: 'amber',
    exception: 'coral',
  }

  return (
    <GlassPanel intensity="low" className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-container-lowest/40">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-violet">layers</span>
          <h3 className="text-xs font-semibold text-text-primary tracking-wide uppercase">Call Stack</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-border-subtle text-text-tertiary">
            Depth {stack.length}
          </span>
        </div>

        {event && (
          <Chip variant={eventVariantMap[event] || 'cyan'} size="sm" className="font-mono uppercase text-[9px]">
            {event}
          </Chip>
        )}
      </div>

      {/* Frame List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {stack.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 text-text-tertiary">
            <span className="material-symbols-outlined text-2xl mb-1 opacity-40">layers_clear</span>
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
