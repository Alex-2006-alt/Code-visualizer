import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface AmbientBackgroundProps {
  className?: string
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      style={{ zIndex: -1 }}
      className={`fixed inset-0 pointer-events-none overflow-hidden bg-transparent z-[-1] ${className}`}
    >
      {/* Layer 1: Blue Glow (Top-Left 640px circle, blur 130px, partly off-screen: top -200px, left -160px) */}
      <motion.div
        className="fixed -top-[200px] -left-[160px] w-[640px] h-[640px] rounded-full blur-[130px] pointer-events-none ambient-glow"
        style={{ background: 'var(--orb-1)' }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                opacity: [0.88, 1, 0.88],
              }
        }
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Layer 2: GREEN Glow (Bottom-Right deep teal-green 700px circle, blur 140px, partly off-screen: bottom -240px, right -180px) */}
      <motion.div
        className="fixed -bottom-[240px] -right-[180px] w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none ambient-glow"
        style={{ background: 'var(--orb-2)' }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                opacity: [0.88, 1, 0.88],
              }
        }
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Static Subtle Dot Grid (3% white opacity, 24px spacing, above glows) */}
      <div className="fixed inset-0 pointer-events-none bg-dot-grid" />
    </div>
  )
}
