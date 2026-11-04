/**
 * Practice Mode Type Definitions
 *
 * Synchronized with backend models in `app.schemas`.
 */

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard'

export interface ProblemSummary {
  id: string
  title: string
  difficulty: ProblemDifficulty
  category: string
  test_count: number
}

export interface VisibleTestCase {
  id: number
  input: Record<string, unknown>
  expected: unknown
  visible: boolean
}

export interface ProblemDetail {
  id: string
  title: string
  difficulty: ProblemDifficulty
  category: string
  statement: string
  constraints: string[]
  function_name: string
  starter_code: string
  example_tests: VisibleTestCase[]
}

export type TestResultStatus = 'passed' | 'failed' | 'error' | 'timeout'

export interface TestCaseResult {
  test_id: number
  visible: boolean
  status: TestResultStatus
  input?: Record<string, unknown>
  expected?: unknown
  actual?: unknown
  error?: string | null
  execution_time_ms?: number
}

export interface ProblemSubmitResponse {
  problem_id: string
  all_passed: boolean
  passed_count: number
  total_count: number
  results: TestCaseResult[]
}
