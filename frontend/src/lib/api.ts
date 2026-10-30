import { TraceStep } from '@/types/trace'
import { toast } from '@/components/ui/toastStore'
import { PRESETS, DEFAULT_PRESET } from '@/mocks'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export interface RunResponse {
  steps?: TraceStep[]
  error?: string | null
  truncated?: boolean
  step_limit_reached?: boolean
  detail?: string
}

export interface ExecutionResult {
  steps: TraceStep[]
  truncated: boolean
  error: string | null
}

export interface ExecuteOptions {
  useMocks?: boolean
  apiUrl?: string
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
 * Executes Python code against the backend API or mock runner with full execution metadata
 */
export async function executeCode(
  code: string,
  options?: ExecuteOptions
): Promise<ExecutionResult> {
  const trimmed = code.trim()
  if (!trimmed) {
    toast.warning('Empty Code', 'Please enter some Python code to visualize.')
    return { steps: [], truncated: false, error: null }
  }

  const shouldMock = options?.useMocks ?? USE_MOCKS

  // 1. Mock execution path when active
  if (shouldMock) {
    await new Promise((resolve) => setTimeout(resolve, 50))
    toast.info('Simulated Run', 'Executed using offline mock trace engine.')
    return {
      steps: getMockStepsForCode(trimmed),
      truncated: false,
      error: null,
    }
  }

  const endpoint = `${options?.apiUrl || API_URL}/run`

  // 2. Real API network request to FastAPI backend
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: trimmed }),
    })

    // Handle rate-limit status (429)
    if (response.status === 429) {
      const errData = (await response.json().catch(() => ({}))) as RunResponse
      toast.error(
        'Rate Limit Exceeded',
        errData.detail || 'You have exceeded the request quota. Please wait a moment before trying again.'
      )
      throw new Error(errData.detail || 'Rate limit exceeded')
    }

    // Handle concurrency limit / server busy (503)
    if (response.status === 503) {
      const errData = (await response.json().catch(() => ({}))) as RunResponse
      toast.error(
        'Server Busy',
        errData.detail || 'Server is busy. Max concurrent sandboxes reached. Please retry.'
      )
      throw new Error(errData.detail || 'Server busy')
    }

    // Handle execution timeout (408 / 504)
    if (response.status === 408 || response.status === 504) {
      const errData = (await response.json().catch(() => ({}))) as RunResponse
      toast.error(
        'Execution Timeout',
        errData.detail || 'Execution timed out. Please simplify your code or reduce loop iterations.'
      )
      throw new Error(errData.detail || 'Execution timeout')
    }

    // Handle request validation error (422)
    if (response.status === 422) {
      const errData = (await response.json().catch(() => ({}))) as { detail?: any }
      let msg = 'Invalid request payload.'
      if (Array.isArray(errData.detail)) {
        msg = errData.detail.map((d: any) => `${d.loc?.join('.') || 'field'}: ${d.msg}`).join(', ')
      } else if (typeof errData.detail === 'string') {
        msg = errData.detail
      }
      toast.error('Validation Error', msg)
      throw new Error(msg)
    }

    // Handle syntax or user script error (400)
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

    let data: RunResponse | TraceStep[]
    try {
      data = (await response.json()) as RunResponse | TraceStep[]
    } catch {
      toast.error('Malformed Response', 'Received invalid JSON data from server.')
      throw new Error('Malformed JSON response from server')
    }

    let steps: TraceStep[] = []
    let isTruncated = false
    let executionError: string | null = null

    if (Array.isArray(data)) {
      steps = data
    } else if (data && Array.isArray(data.steps)) {
      steps = data.steps
      isTruncated = Boolean(data.step_limit_reached || data.truncated)
      executionError = data.error || null
    }

    if (isTruncated) {
      toast.warning(
        'Step Limit Reached',
        'Execution exceeded maximum step threshold and was truncated.'
      )
    } else {
      toast.success('Execution Finished', `Successfully captured ${steps.length} execution steps.`)
    }

    return {
      steps,
      truncated: isTruncated,
      error: executionError,
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      toast.error('Network Error', 'Could not connect to FastAPI server. Please check backend status.')
      if (shouldMock) {
        toast.warning('Backend Offline', 'Falling back to mock trace.')
        return {
          steps: getMockStepsForCode(trimmed),
          truncated: false,
          error: null,
        }
      }
      throw error
    }
    throw error
  }
}

/**
 * Executes Python code against the backend API or mock runner
 */
export async function runCode(code: string, options?: ExecuteOptions): Promise<TraceStep[]> {
  const result = await executeCode(code, options)
  return result.steps
}
