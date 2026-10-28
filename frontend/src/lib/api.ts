import { TraceStep } from '@/types/trace'
import { toast } from '@/components/ui/toastStore'
import { PRESETS, DEFAULT_PRESET } from '@/mocks'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export interface RunResponse {
  steps?: TraceStep[]
  error?: string
  step_limit_reached?: boolean
  detail?: string
}

/**
 * Finds the closest mock preset steps based on Python code signature
 */
function getMockStepsForCode(code: string): TraceStep[] {
  const normalized = code.toLowerCase()
  if (normalized.includes('bubble') || normalized.includes('swap')) {
    return PRESETS['bubble-sort'].steps
  }
  if (normalized.includes('factorial')) {
    return PRESETS['factorial'].steps
  }
  if (normalized.includes('two_sum') || normalized.includes('target')) {
    return PRESETS['two-sum'].steps
  }
  return DEFAULT_PRESET.steps
}

/**
 * Executes Python code against the backend API or mock runner
 */
export async function runCode(code: string): Promise<TraceStep[]> {
  const trimmed = code.trim()
  if (!trimmed) {
    toast.warning('Empty Code', 'Please enter some Python code to visualize.')
    return []
  }

  // 1. Mock execution path when VITE_USE_MOCKS is active
  if (USE_MOCKS) {
    // Simulate brief network latency (250ms)
    await new Promise((resolve) => setTimeout(resolve, 250))
    toast.info('Simulated Run', 'Executed using offline mock trace engine.')
    return getMockStepsForCode(trimmed)
  }

  // 2. Real API network request to FastAPI backend
  try {
    const response = await fetch(`${API_URL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: trimmed }),
    })

    // Handle rate-limit status
    if (response.status === 429) {
      toast.error(
        'Rate Limit Exceeded',
        'You have exceeded the request quota. Please wait a moment before trying again.'
      )
      throw new Error('Rate limit exceeded')
    }

    // Handle syntax or user script error
    if (response.status === 400) {
      const errData = (await response.json().catch(() => ({}))) as RunResponse
      toast.error('Syntax / Runtime Error', errData.detail || errData.error || 'Check Python script syntax.')
      throw new Error(errData.detail || 'Script syntax error')
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      toast.error('Execution Failed', `Server responded with status ${response.status}: ${errText}`)
      throw new Error(`Execution error: ${response.status}`)
    }

    const data = (await response.json()) as RunResponse | TraceStep[]

    // Backend might return array directly or wrapped in { steps, step_limit_reached }
    let steps: TraceStep[] = []
    let stepLimitReached = false

    if (Array.isArray(data)) {
      steps = data
    } else if (data && Array.isArray(data.steps)) {
      steps = data.steps
      stepLimitReached = Boolean(data.step_limit_reached)
    }

    if (stepLimitReached) {
      toast.warning(
        'Step Limit Reached',
        'Execution exceeded maximum step threshold and was truncated.'
      )
    } else {
      toast.success('Execution Finished', `Successfully captured ${steps.length} execution steps.`)
    }

    return steps
  } catch (error) {
    // If real backend call failed due to network / CORS / offline, fallback gracefully with notice
    if (USE_MOCKS || (error instanceof TypeError && error.message.includes('fetch'))) {
      toast.warning('Backend Offline', 'Could not connect to FastAPI server. Falling back to mock trace.')
      return getMockStepsForCode(trimmed)
    }
    throw error
  }
}

