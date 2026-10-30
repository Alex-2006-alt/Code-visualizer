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
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onClick}
      className={`p-3 rounded-inner border cursor-pointer transition-colors duration-200 ${
        isTop
          ? 'bg-accent-soft border-accent/40 shadow-panel'
          : 'bg-glass border-border hover:border-border-strong opacity-80 hover:opacity-100'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-text-3">#{depth}</span>
          <span className={`text-xs font-mono font-medium ${isTop ? 'text-accent' : 'text-text'}`}>
            {frame.fn}()
          </span>
          {isTop && (
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-sans bg-accent/20 text-accent font-medium">
              active
            </span>
          )}
        </div>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-glass border border-border ${isTop ? 'text-accent' : 'text-text-3'}`}>
          line {frame.line}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-3">
        <span>{localCount} {localCount === 1 ? 'local' : 'locals'}</span>
        <div className="flex items-center gap-1 max-w-[60%] truncate font-mono text-[10px] text-text-2">
          {Object.entries(frame.locals)
            .slice(0, 3)
            .map(([k, v]) => `${k}=${String(v)}`)
            .join(', ')}
        </div>
      </div>
    </motion.div>
  )
}
