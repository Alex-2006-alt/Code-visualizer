export interface Frame {
  fn: string
  line: number
  locals: Record<string, unknown>
}

export interface HeapObject {
  id: string
  type: 'list' | 'dict' | 'set' | 'object' | 'instance'
  address: string
  value: unknown[] | Record<string, unknown>
  targetIndex?: number
  label?: string
  className?: string
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


export interface ComplexityPoint {
  n: number
  steps: number
  ops?: number
  peak_items: number
  depth: number
}

export interface ComplexityResult {
  time_label: string
  space_label: string
  confidence: 'high' | 'medium' | 'low'
  points: ComplexityPoint[]
  fit: {
    model?: string
    r2?: number
    next_best?: string
    next_r2?: number
    space_r2?: number
  }
  notes: string[]
  truncated: boolean
  case: string
  label?: string
}

export interface ComplexityParams {
  code: string
  function_name: string
  input_kind?: 'int_list' | 'sorted_int_list' | 'reversed_int_list' | 'string' | 'int_n' | 'int_list_and_target'
  case?: 'best' | 'average' | 'worst'
  sizes?: number[]
}
