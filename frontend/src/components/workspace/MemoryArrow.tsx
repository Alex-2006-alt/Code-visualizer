import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface MemoryArrowProps {
  startX: number
  startY: number
  endX: number
  endY: number
  color?: string
  className?: string
}

export const MemoryArrow: React.FC<MemoryArrowProps> = ({
  startX,
  startY,
  endX,
  endY,
  color = '#7FA8D1',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()
  const dx = endX - startX
  const controlX1 = startX + dx * 0.5
  const controlY1 = startY
  const controlX2 = startX + dx * 0.5
  const controlY2 = endY

  const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`

  return (
    <svg className={`pointer-events-none absolute inset-0 w-full h-full overflow-visible ${className}`}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="7"
          markerHeight="7"
          refX="5"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 7 3.5, 0 7" fill={color} />
        </marker>
      </defs>

      <motion.path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={shouldReduceMotion ? '' : 'animate-[dash_2s_linear_infinite]'}
        markerEnd="url(#arrowhead)"
      />
    </svg>
  )
}
