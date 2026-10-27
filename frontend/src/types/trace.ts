export interface Frame {
  fn: string
  line: number
  locals: Record<string, unknown>
}

export interface HeapObject {
  id: string
  type: 'list' | 'dict' | 'set' | 'object'
  address: string
  value: unknown[] | Record<string, unknown>
  targetIndex?: number
  label?: string
}

export interface PredictQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface TraceStep {
  event: 'line' | 'call' | 'return' | 'exception'
  line: number
  stack: Frame[]
  output: string
  ret?: unknown
  heap?: Record<string, unknown>
  heapObjects?: HeapObject[]
  predict?: PredictQuestion
  mutatedVariable?: string
  explanation?: string
}

export interface TracePreset {
  id: string
  title: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  code: string
  steps: TraceStep[]
  timeComplexity: string
  spaceComplexity: string
}
