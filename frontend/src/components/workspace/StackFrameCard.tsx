import React from 'react'
import { motion } from 'framer-motion'
import { Frame } from '@/types/trace'

interface StackFrameCardProps {
  frame: Frame
  depth: number
  isTop: boolean
  onClick?: () => void
}

export const StackFrameCard: React.FC<StackFrameCardProps> = ({
  frame,
  depth,
  isTop,
  onClick,
}) => {
  const localCount = Object.keys(frame.locals).length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 16, scale: 0.96 }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isTop
          ? 'bg-violet/10 border-violet/40 shadow-[0_0_16px_rgba(202,190,255,0.15)] ring-1 ring-violet/30'
          : 'bg-container-lowest/40 border-border-subtle hover:border-border-default opacity-80 hover:opacity-100'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-text-tertiary">#{depth}</span>
          <span className={`text-xs font-mono font-bold ${isTop ? 'text-violet' : 'text-text-primary'}`}>
            {frame.fn}()
          </span>
          {isTop && (
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-violet/20 text-violet">
              Active
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-surface/80 border border-border-subtle text-cyan font-semibold">
          line {frame.line}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-tertiary">
        <span>{localCount} {localCount === 1 ? 'local' : 'locals'}</span>
        <div className="flex items-center gap-1 max-w-[60%] truncate font-mono text-[10px] text-text-secondary">
          {Object.entries(frame.locals)
            .slice(0, 3)
            .map(([k, v]) => `${k}=${String(v)}`)
            .join(', ')}
        </div>
      </div>
    </motion.div>
  )
}
