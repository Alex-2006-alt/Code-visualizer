import React from 'react'

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
  color = '#CABEFF',
  className = '',
}) => {
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
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 8 4, 0 8" fill={color} />
        </marker>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4 4"
        className="animate-[dash_1.5s_linear_infinite]"
        markerEnd="url(#arrowhead)"
        filter="url(#glow)"
        opacity="0.85"
      />
    </svg>
  )
}
