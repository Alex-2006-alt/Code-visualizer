import React from 'react'
import { AmbientBackground } from './AmbientBackground'

interface BackgroundCanvasProps {
  showOrbs?: boolean
  showGrid?: boolean
  className?: string
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ className = '' }) => {
  return <AmbientBackground className={className} />
}
