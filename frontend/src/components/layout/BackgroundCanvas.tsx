import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface BackgroundCanvasProps {
  showOrbs?: boolean
  showGrid?: boolean
  className?: string
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({
  showOrbs = true,
  showGrid = true,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 bg-surface ${className}`}
    >
      {/* Dynamic Ambient Gradient Orbs */}
      {showOrbs && (
        <>
          {/* Top-Left Electric Violet Glow */}
          <motion.div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-container/20 blur-[128px]"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    x: [0, 25, -15, 0],
                    y: [0, 20, -10, 0],
                    scale: [1, 1.06, 0.95, 1],
                  }
            }
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Center-Right Cyan Glow */}
          <motion.div
            className="absolute top-1/3 -right-24 w-[480px] h-[480px] rounded-full bg-secondary/15 blur-[140px]"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    x: [0, -30, 15, 0],
                    y: [0, -25, 20, 0],
                    scale: [1, 0.94, 1.08, 1],
                  }
            }
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Bottom-Center Tertiary Amber/Magenta Glow */}
          <motion.div
            className="absolute -bottom-40 left-1/4 w-[520px] h-[520px] rounded-full bg-tertiary-container/10 blur-[150px]"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    x: [0, 20, -20, 0],
                    y: [0, -15, 15, 0],
                    scale: [1, 1.05, 0.96, 1],
                  }
            }
            transition={{
              duration: 26,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      {/* Substrate Dot Grid */}
      {showGrid && (
        <div className="absolute inset-0 bg-dot-grid opacity-35" />
      )}
    </div>
  )
}
