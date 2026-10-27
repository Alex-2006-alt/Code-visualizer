import { TracePreset } from '@/types/trace'
import { TWO_SUM_PRESET } from './twoSumTrace'
import { FACTORIAL_PRESET } from './factorialTrace'
import { BUBBLE_SORT_PRESET } from './bubbleSortTrace'

export * from './twoSumTrace'
export * from './factorialTrace'
export * from './bubbleSortTrace'

export const PRESETS: Record<string, TracePreset> = {
  'two-sum': TWO_SUM_PRESET,
  'factorial-recursion': FACTORIAL_PRESET,
  'bubble-sort': BUBBLE_SORT_PRESET,
}

export const DEFAULT_PRESET = TWO_SUM_PRESET
