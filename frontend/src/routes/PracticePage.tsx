import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GlassPanel, GlassButton, Tabs } from '@/components/ui'
import { CodeEditor } from '@/components/workspace/CodeEditor'
import { fetchProblemsList, fetchProblemDetail, submitProblemSolution } from '@/lib/api'
import {
  ProblemSummary,
  ProblemDetail,
  ProblemSubmitResponse,
  ProblemDifficulty,
  TestCaseResult,
} from '@/types/practice'
import { useTraceStore } from '@/store/useTraceStore'
import { toast } from '@/components/ui/toastStore'

const SOLVED_STORAGE_KEY = 'codetrace_solved_problems'

function getSolvedProblemIds(): string[] {
  try {
    const raw = localStorage.getItem(SOLVED_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function markProblemSolved(id: string) {
  try {
    const solved = new Set(getSolvedProblemIds())
    solved.add(id)
    localStorage.setItem(SOLVED_STORAGE_KEY, JSON.stringify(Array.from(solved)))
  } catch {
    // Ignore localStorage storage quota failures
  }
}

export const PracticePage: React.FC = () => {
  const { problemId } = useParams<{ problemId?: string }>()
  const navigate = useNavigate()

  const [problems, setProblems] = useState<ProblemSummary[]>([])
  const [activeProblem, setActiveProblem] = useState<ProblemDetail | null>(null)
  const [code, setCode] = useState<string>('')
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const [isProblemLoading, setIsProblemLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<ProblemSubmitResponse | null>(null)
  const [solvedIds, setSolvedIds] = useState<string[]>(getSolvedProblemIds())

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | ProblemDifficulty>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTestTab, setActiveTestTab] = useState<number>(0)

  // Store action to transfer code and input to Workspace visualizer
  const setStudioCode = useTraceStore((s) => s.setCode)

  // 1. Fetch catalog on mount
  useEffect(() => {
    let mounted = true
    setIsCatalogLoading(true)
    fetchProblemsList()
      .then((data) => {
        if (mounted) {
          setProblems(data)
          setIsCatalogLoading(false)
        }
      })
      .catch(() => {
        if (mounted) setIsCatalogLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  // 2. Select initial problem or update on route change
  useEffect(() => {
    const targetId = problemId || (problems.length > 0 ? problems[0].id : null)
    if (!targetId) return

    let mounted = true
    setIsProblemLoading(true)
    setSubmissionResult(null)
    setActiveTestTab(0)

    fetchProblemDetail(targetId)
      .then((data) => {
        if (mounted && data) {
          setActiveProblem(data)
          setCode(data.starter_code)
          setIsProblemLoading(false)
        }
      })
      .catch(() => {
        if (mounted) setIsProblemLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [problemId, problems])

  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter
      const matchesQuery =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesDiff && matchesQuery
    })
  }, [problems, difficultyFilter, searchQuery])

  // Select a problem
  const handleSelectProblem = (id: string) => {
    navigate(`/practice/${id}`)
  }

  // Reset starter code
  const handleResetCode = () => {
    if (activeProblem) {
      setCode(activeProblem.starter_code)
      setSubmissionResult(null)
      toast.info('Code Reset', 'Starter template reloaded.')
    }
  }

  // Submit solution to sandbox evaluator
  const handleSubmit = async () => {
    if (!activeProblem) return
    setIsSubmitting(true)
    try {
      const result = await submitProblemSolution(activeProblem.id, code)
      setSubmissionResult(result)

      if (result.all_passed) {
        markProblemSolved(activeProblem.id)
        setSolvedIds(getSolvedProblemIds())
        toast.success(
          'All Tests Passed! 🎉',
          `Congratulations! All ${result.total_count} test cases passed successfully.`
        )
      } else {
        toast.warning(
          'Tests Incomplete',
          `${result.passed_count}/${result.total_count} test cases passed. Review failing cases below.`
        )
      }
    } catch {
      // Toast fired inside API client
    } finally {
      setIsSubmitting(false)
    }
  }

  // Visualize failing test case in Workspace trace mode
  const handleVisualizeTest = (testResult: TestCaseResult) => {
    if (!activeProblem || !testResult.input) return

    const inputArgs = Object.entries(testResult.input)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(', ')

    const visualizerScript = `${code.trim()}

# --- Visualizing Test #${testResult.test_id} ---
# Input: ${JSON.stringify(testResult.input)}
result = ${activeProblem.function_name}(${inputArgs})
print("Result:", result)
`

    setStudioCode(visualizerScript)
    toast.info('Loaded into Visualizer', `Stepping through Test #${testResult.test_id} in Studio trace.`)
    navigate('/workspace')
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] pb-16 flex flex-col" data-testid="practice-page">
      {/* Cockpit Sub-Header */}
      <div className="w-full px-4 sm:px-6 py-2.5 bg-glass border-b border-border backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-lg">code_blocks</span>
            <span className="font-serif text-lg tracking-tight text-text">Practice Arena</span>
          </div>

          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-glass text-text-3 text-[11px] font-mono border border-border">
            20 Algorithmic Problems
          </span>
        </div>

        {/* Solved Tally */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span
            data-testid="solved-counter-badge"
            className="px-2.5 py-0.5 rounded-full bg-sage-soft border border-sage/30 text-sage flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {solvedIds.length} / {problems.length || 20} Solved
          </span>
        </div>
      </div>

      {/* Main Grid: Catalog Sidebar (3 cols) + Workspace Area (9 cols) */}
      <div className="flex-1 w-full px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Problem Catalog & Filters (lg:col-span-4) */}
        <div className="flex flex-col gap-3 lg:col-span-4 w-full">
          <GlassPanel level={2} className="p-3.5 flex flex-col gap-3 shadow-panel">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-text uppercase tracking-wider">
                Problems
              </span>
              <span className="text-[11px] font-mono text-text-3">
                {filteredProblems.length} available
              </span>
            </div>

            {/* Search Input */}
            <input
              type="text"
              data-testid="input-problem-search"
              placeholder="Search problem or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-control bg-glass-sunken border border-border text-text font-mono text-xs focus:outline-none focus:border-accent placeholder:text-text-3/60"
            />

            {/* Difficulty Filter Tabs */}
            <Tabs
              variant="pill"
              activeTab={difficultyFilter}
              onChange={(t) => setDifficultyFilter(t as 'All' | ProblemDifficulty)}
              tabs={[
                { id: 'All', label: 'All' },
                { id: 'Easy', label: 'Easy' },
                { id: 'Medium', label: 'Medium' },
                { id: 'Hard', label: 'Hard' },
              ]}
            />
          </GlassPanel>

          {/* Problem List Items */}
          <div
            data-testid="problems-list-container"
            className="flex flex-col gap-2 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1"
          >
            {isCatalogLoading && (
              <div className="p-8 text-center text-text-3 font-mono text-xs">
                Loading problem catalog...
              </div>
            )}

            {!isCatalogLoading &&
              filteredProblems.map((p) => {
                const isSelected = activeProblem?.id === p.id
                const isSolved = solvedIds.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProblem(p.id)}
                    data-testid={`problem-card-${p.id}`}
                    className={`w-full p-3 rounded-panel text-left transition-all border ${
                      isSelected
                        ? 'bg-glass-raised border-accent shadow-glow-accent'
                        : 'bg-glass border-border hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isSolved ? (
                          <span className="material-symbols-outlined text-[16px] text-sage shrink-0">
                            check_circle
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px] text-text-3/60 shrink-0">
                            radio_button_unchecked
                          </span>
                        )}
                        <span className="font-medium text-text text-xs truncate">
                          {p.title}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0 ${
                          p.difficulty === 'Easy'
                            ? 'bg-sage-soft text-sage border border-sage/30'
                            : p.difficulty === 'Medium'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-error-soft text-error border border-error/30'
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-text-3">
                      <span>{p.category}</span>
                      <span>{p.test_count} tests</span>
                    </div>
                  </button>
                )
              })}

            {!isCatalogLoading && filteredProblems.length === 0 && (
              <div className="p-8 text-center text-text-3 font-mono text-xs">
                No problems match your filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Statement, Code Editor & Test Results (lg:col-span-8) */}
        <div className="flex flex-col gap-4 lg:col-span-8 w-full">
          {isProblemLoading || !activeProblem ? (
            <GlassPanel level={2} className="p-12 text-center text-text-3 font-mono text-xs">
              Loading problem statement and editor...
            </GlassPanel>
          ) : (
            <>
              {/* Problem Statement Card */}
              <GlassPanel level={2} className="p-4 sm:p-5 flex flex-col gap-3 shadow-panel">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2
                      data-testid="problem-title-heading"
                      className="text-base sm:text-lg font-serif text-text tracking-tight"
                    >
                      {activeProblem.title}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        activeProblem.difficulty === 'Easy'
                          ? 'bg-sage-soft text-sage border border-sage/30'
                          : activeProblem.difficulty === 'Medium'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-error-soft text-error border border-error/30'
                      }`}
                    >
                      {activeProblem.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-glass border border-border text-[10px] font-mono text-text-3">
                      {activeProblem.category}
                    </span>
                  </div>

                  {solvedIds.includes(activeProblem.id) && (
                    <span
                      data-testid="problem-solved-badge"
                      className="px-2.5 py-0.5 rounded-full bg-sage-soft border border-sage/40 text-sage text-[11px] font-mono font-medium flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Solved
                    </span>
                  )}
                </div>

                {/* Statement Body */}
                <div
                  data-testid="problem-statement-body"
                  className="text-text-2 text-xs leading-relaxed whitespace-pre-wrap font-sans"
                >
                  {activeProblem.statement}
                </div>

                {/* Constraints */}
                {activeProblem.constraints && activeProblem.constraints.length > 0 && (
                  <div className="pt-2 border-t border-border flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-3">
                      Constraints:
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-text-3 font-mono space-y-0.5">
                      {activeProblem.constraints.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </GlassPanel>

              {/* Code Editor Header & Monaco Editor */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-mono font-medium text-accent uppercase tracking-wider">
                    Solution Implementation (Python 3.12)
                  </span>

                  <div className="flex items-center gap-2">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={handleResetCode}
                      leftIcon={<span className="material-symbols-outlined text-[15px]">restart_alt</span>}
                      data-testid="btn-reset-starter-code"
                    >
                      Reset Starter
                    </GlassButton>

                    <GlassButton
                      variant="primary"
                      size="sm"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      data-testid="btn-submit-solution"
                      leftIcon={
                        <span
                          className={`material-symbols-outlined text-[15px] ${
                            isSubmitting ? 'animate-spin' : ''
                          }`}
                        >
                          {isSubmitting ? 'progress_activity' : 'play_arrow'}
                        </span>
                      }
                    >
                      {isSubmitting ? 'Evaluating...' : 'Run Tests'}
                    </GlassButton>
                  </div>
                </div>

                <CodeEditor
                  code={code}
                  currentLine={1}
                  onChange={(newCode) => setCode(newCode || '')}
                  height="360px"
                />
              </div>

              {/* Test Results Panel */}
              {submissionResult && (
                <GlassPanel
                  level={2}
                  className="p-4 flex flex-col gap-3 shadow-panel border border-border"
                  data-testid="practice-results-panel"
                >
                  {/* Overview Banner */}
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-lg ${
                          submissionResult.all_passed ? 'text-sage' : 'text-amber-400'
                        }`}
                      >
                        {submissionResult.all_passed ? 'check_circle' : 'warning'}
                      </span>
                      <span
                        data-testid="results-status-title"
                        className="font-mono text-xs font-semibold text-text"
                      >
                        {submissionResult.all_passed
                          ? `All ${submissionResult.total_count} Tests Passed!`
                          : `${submissionResult.passed_count} / ${submissionResult.total_count} Tests Passed`}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-text-3">
                      {submissionResult.all_passed ? 'Accepted' : 'Wrong Answer / Runtime Error'}
                    </span>
                  </div>

                  {/* Test Selector Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {submissionResult.results.map((res, idx) => {
                      const isActive = activeTestTab === idx
                      return (
                        <button
                          key={res.test_id}
                          onClick={() => setActiveTestTab(idx)}
                          data-testid={`test-result-tab-${res.test_id}`}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1 shrink-0 transition-colors ${
                            isActive
                              ? 'bg-glass-raised border border-accent text-accent font-semibold'
                              : 'bg-glass border border-border text-text-2 hover:text-text'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              res.status === 'passed' ? 'bg-sage' : 'bg-error'
                            }`}
                          />
                          Test {res.test_id}
                          {!res.visible && (
                            <span className="text-[9px] text-text-3/80 font-mono">(Hidden)</span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Selected Test Detail Card */}
                  {submissionResult.results[activeTestTab] && (
                    <div
                      data-testid="test-detail-card"
                      className="p-3.5 rounded-panel bg-panel-body border border-border flex flex-col gap-2.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text">
                            Case #{submissionResult.results[activeTestTab].test_id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              submissionResult.results[activeTestTab].status === 'passed'
                                ? 'bg-sage-soft text-sage border border-sage/30'
                                : 'bg-error-soft text-error border border-error/30'
                            }`}
                          >
                            {submissionResult.results[activeTestTab].status.toUpperCase()}
                          </span>
                        </div>

                        {submissionResult.results[activeTestTab].execution_time_ms !== undefined && (
                          <span className="text-[11px] text-text-3">
                            {submissionResult.results[activeTestTab].execution_time_ms} ms
                          </span>
                        )}
                      </div>

                      {/* Visible Test Inputs and Expected/Actual Outputs */}
                      {submissionResult.results[activeTestTab].visible ? (
                        <div className="space-y-2 pt-1">
                          <div>
                            <span className="text-[10px] text-text-3 block">Input:</span>
                            <pre className="p-2 rounded bg-bg border border-border text-text text-[11px] overflow-x-auto">
                              <code>
                                {JSON.stringify(
                                  submissionResult.results[activeTestTab].input,
                                  null,
                                  2
                                )}
                              </code>
                            </pre>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-text-3 block">Expected:</span>
                              <pre className="p-2 rounded bg-bg border border-border text-sage text-[11px] overflow-x-auto">
                                <code>
                                  {JSON.stringify(
                                    submissionResult.results[activeTestTab].expected
                                  )}
                                </code>
                              </pre>
                            </div>

                            <div>
                              <span className="text-[10px] text-text-3 block">Actual Output:</span>
                              <pre
                                className={`p-2 rounded bg-bg border border-border text-[11px] overflow-x-auto ${
                                  submissionResult.results[activeTestTab].status === 'passed'
                                    ? 'text-sage'
                                    : 'text-error'
                                }`}
                              >
                                <code>
                                  {submissionResult.results[activeTestTab].error
                                    ? submissionResult.results[activeTestTab].error
                                    : JSON.stringify(
                                        submissionResult.results[activeTestTab].actual
                                      )}
                                </code>
                              </pre>
                            </div>
                          </div>

                          {/* "Visualize this test" Button on Failing Visible Test */}
                          {submissionResult.results[activeTestTab].status !== 'passed' && (
                            <div className="pt-2 flex justify-end">
                              <GlassButton
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                  handleVisualizeTest(submissionResult.results[activeTestTab])
                                }
                                data-testid="btn-visualize-test"
                                leftIcon={
                                  <span className="material-symbols-outlined text-[15px]">
                                    visibility
                                  </span>
                                }
                              >
                                Visualize this test
                              </GlassButton>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-text-3 font-mono text-[11px]">
                          Hidden test case for edge verification. Inputs and outputs are concealed.
                        </div>
                      )}
                    </div>
                  )}
                </GlassPanel>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
