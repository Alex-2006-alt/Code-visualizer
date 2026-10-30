import '@testing-library/jest-dom/vitest'
import { MotionGlobalConfig } from 'framer-motion'

// Disable framer-motion animations in jsdom test runs for instant deterministic rendering
MotionGlobalConfig.skipAnimations = true

// Ensure unit tests evaluate real API logic and fetch mocks rather than mock fallback presets
;(import.meta.env as Record<string, any>).VITE_USE_MOCKS = 'false'
