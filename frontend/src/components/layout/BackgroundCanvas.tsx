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
      {/* Dynamic Ambient Blurred Orbs (Midnight Blue & Deep Sage) */}
      {showOrbs && !shouldReduceMotion && (
        <>
          {/* Orb 1: Deep Blue (Top-Left ~620px, 40s slow drift) */}
          <motion.div
            className="absolute -top-48 -left-48 w-[620px] h-[620px] rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'var(--orb-1)' }}
            animate={{
              x: [0, 40, -30, 0],
              y: [0, 30, -25, 0],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Orb 2: Deep Teal-Green / Sage (Bottom-Right ~680px, 40s slow drift) */}
          <motion.div
            className="absolute -bottom-56 -right-56 w-[680px] h-[680px] rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'var(--orb-2)' }}
            animate={{
              x: [0, -35, 25, 0],
              y: [0, -30, 35, 0],
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
            className="absolute -top-48 -left-48 w-[620px] h-[620px] rounded-full blur-[100px] pointer-events-none opacity-80"
            style={{ background: 'var(--orb-1)' }}
          />
          <div
            className="absolute -bottom-56 -right-56 w-[680px] h-[680px] rounded-full blur-[100px] pointer-events-none opacity-80"
            style={{ background: 'var(--orb-2)' }}
          />
        </>
      )}

      {/* Subtle 3% Opacity Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
    </div>
  )
}
