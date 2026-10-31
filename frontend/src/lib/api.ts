import { TraceStep } from '@/types/trace'
import { toast } from '@/components/ui/toastStore'
import { PRESETS } from '@/mocks'

function getEffectiveApiUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000'
  }
  return 'http://localhost:8000'
}

const API_URL = getEffectiveApiUrl()

/**
 * Mock data is development only: guarded by an explicit flag, off by default, disabled in production builds.
 */
export const isMockMode = Boolean(
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true'
)

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
  requestId?: string
}

export interface CompareResult {
  a: { steps: TraceStep[]; truncated: boolean; error: string | null }
  b: { steps: TraceStep[]; truncated: boolean; error: string | null }
  step_counts: { a: number; b: number }
}

/**
 * Finds the closest mock preset steps based on Python code signature
 */
function getMockStepsForCode(code: string): TraceStep[] | null {
  const normalized = code.toLowerCase()
  if (normalized.includes('bubble_sort') || (normalized.includes('bubble') && normalized.includes('swap'))) {
    return PRESETS['bubble-sort'].steps
  }
  if (normalized.includes('factorial') && (normalized.includes('def ') || normalized.includes('return '))) {
    return PRESETS['factorial'].steps
  }
  if (normalized.includes('two_sum') || (normalized.includes('target') && normalized.includes('seen'))) {
    return PRESETS['two-sum'].steps
  }
  return null
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

  const shouldMock = options?.useMocks ?? isMockMode

  // 1. Mock execution path when active
  if (shouldMock) {
    await new Promise((resolve) => setTimeout(resolve, 50))
    const mockSteps = getMockStepsForCode(trimmed)
    if (!mockSteps) {
      toast.warning('Mock Mode Limitation', 'Offline mock runner only supports preset examples. Please connect to the backend server to trace custom code.')
      return {
        steps: [],
        truncated: false,
        error: 'Offline mock runner only supports curated presets. Connect to the backend server to execute custom code.',
      }
    }
    toast.info('Simulated Run', 'Executed using offline mock trace engine.')
    return {
      steps: mockSteps,
      truncated: false,
      error: null,
    }
  }

  const endpoint = `${options?.apiUrl || API_URL}/api/run`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (options?.requestId) {
    headers['X-Request-ID'] = options.requestId
  }

  // 2. Real API network request to FastAPI backend
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
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
      toast.error('Network Error', `Could not connect to FastAPI backend at ${endpoint}. Please verify the server is running.`)
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

/**
 * Persists a code snippet to the backend and returns the share ID
 */
export async function createSnippet(code: string, title?: string): Promise<string> {
  const trimmed = code.trim()
  if (!trimmed) {
    toast.warning('Empty Code', 'Please enter some Python code before sharing.')
    return ''
  }

  try {
    const response = await fetch(`${API_URL}/snippets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: trimmed, title }),
    })
    if (!response.ok) {
      throw new Error(`Failed to create snippet: ${response.status}`)
    }
    const data = (await response.json()) as { id: string }
    return data.id
  } catch (error) {
    toast.error('Share Failed', 'Could not create share link on server.')
    throw error
  }
}

/**
 * Retrieves a persisted snippet by share ID
 */
export async function fetchSnippet(id: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/snippets/${id}`)
    if (!response.ok) {
      toast.error('Snippet Not Found', `Snippet with ID '${id}' could not be found.`)
      return null
    }
    const data = (await response.json()) as { code: string }
    return data.code
  } catch {
    toast.error('Snippet Fetch Failed', 'Could not retrieve shared snippet.')
    return null
  }
}

/**
 * Executes two Python programs concurrently and compares their execution metrics
 */
export async function compareCode(codeA: string, codeB: string): Promise<CompareResult> {
  try {
    const response = await fetch(`${API_URL}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code_a: codeA.trim(), code_b: codeB.trim() }),
    })
    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      toast.error('Compare Failed', `Server responded with ${response.status}: ${errText}`)
      throw new Error(`Compare failed: ${response.status}`)
    }
    return (await response.json()) as CompareResult
  } catch (error) {
    toast.error('Comparison Error', 'Could not execute dual-program comparison.')
    throw error
  }
}
