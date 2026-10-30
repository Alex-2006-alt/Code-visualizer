import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface BackgroundCanvasProps {
  showOrbs?: boolean
  showGrid?: boolean
  className?: string
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({
  showOrbs = true,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 bg-bg ${className}`}
    >
      {/* Restrained Ambient Blurred Shapes (Faint Deep Blue only - No Green Haze) */}
      {showOrbs && !shouldReduceMotion && (
        <>
          {/* Orb 1: Deep Blue (Top-Left ~620px, blur 120px, 40s slow drift) */}
          <motion.div
            className="absolute -top-48 -left-48 w-[620px] h-[620px] rounded-full blur-[120px] pointer-events-none"
            style={{ background: 'var(--orb-1)' }}
            animate={{
              x: [0, 35, -25, 0],
              y: [0, 25, -20, 0],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Orb 2: Faint Deep Blue (Bottom-Right ~520px, blur 140px, 40s slow drift) */}
          <motion.div
            className="absolute -bottom-48 -right-48 w-[520px] h-[520px] rounded-full blur-[140px] pointer-events-none"
            style={{ background: 'var(--orb-2)' }}
            animate={{
              x: [0, -30, 20, 0],
              y: [0, -25, 30, 0],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      {/* Static Orbs Fallback for Reduced Motion */}
      {showOrbs && shouldReduceMotion && (
        <>
          <div
            className="absolute -top-48 -left-48 w-[620px] h-[620px] rounded-full blur-[120px] pointer-events-none opacity-80"
            style={{ background: 'var(--orb-1)' }}
          />
          <div
            className="absolute -bottom-48 -right-48 w-[520px] h-[520px] rounded-full blur-[140px] pointer-events-none opacity-80"
            style={{ background: 'var(--orb-2)' }}
          />
        </>
      )}

      {/* Subtle 3% Opacity Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
    </div>
  )
}
