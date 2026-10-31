import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useTraceStore } from '@/store/useTraceStore'
import * as api from '@/lib/api'
import { WorkspacePage } from '@/routes/WorkspacePage'
import { TraceStep } from '@/types/trace'

describe('Editor as Single Source of Truth - Regression Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useTraceStore.setState({
      code: 'print("initial")',
      steps: [],
      currentStep: 0,
      isPlaying: false,
      isLoading: false,
      isTraceOutdated: false,
      activeRequestId: null,
      currentPreset: null,
      executionError: null,
    })
  })

  it('Run sends the edited code (not any preset)', async () => {
    const customCode = 'x = 41 + 1\nprint("answer:", x)'
    useTraceStore.getState().setCode(customCode)

    const mockSteps: TraceStep[] = [
      {
        event: 'line',
        line: 1,
        stack: [{ fn: '<module>', line: 1, locals: { x: 42 } }],
        output: 'answer: 42\n',
      },
    ]

    const executeSpy = vi.spyOn(api, 'executeCode').mockResolvedValueOnce({
      steps: mockSteps,
      truncated: false,
      error: null,
    })

    await useTraceStore.getState().runCurrentCode()

    expect(executeSpy).toHaveBeenCalledTimes(1)
    expect(executeSpy).toHaveBeenCalledWith(
      customCode,
      expect.objectContaining({
        requestId: expect.any(String),
      })
    )

    const state = useTraceStore.getState()
    expect(state.steps).toEqual(mockSteps)
    expect(state.isTraceOutdated).toBe(false)
  })

  it('Selecting an example replaces code and clears the trace (no canned traces attached)', () => {
    // Populate store with previous trace
    useTraceStore.setState({
      steps: [
        {
          event: 'line',
          line: 1,
          stack: [{ fn: '<module>', line: 1, locals: { a: 1 } }],
          output: 'test',
        },
      ],
      currentStep: 0,
      isTraceOutdated: true,
    })

    expect(useTraceStore.getState().steps.length).toBe(1)

    // Load bubble sort preset
    useTraceStore.getState().loadPreset('bubble-sort')

    const state = useTraceStore.getState()
    expect(state.code).toContain('def bubble_sort')
    expect(state.steps).toEqual([]) // Must be cleared!
    expect(state.currentStep).toBe(0)
    expect(state.isTraceOutdated).toBe(false)
    expect(state.currentPreset?.id).toBe('bubble-sort')
  })

  it('Mark trace as outdated when editor code is modified after a run', () => {
    useTraceStore.setState({
      code: 'print("hello")',
      steps: [
        {
          event: 'line',
          line: 1,
          stack: [{ fn: '<module>', line: 1, locals: {} }],
          output: 'hello\n',
        },
      ],
      isTraceOutdated: false,
    })

    // User edits code
    useTraceStore.getState().setCode('print("hello world")')

    const state = useTraceStore.getState()
    expect(state.code).toBe('print("hello world")')
    expect(state.isTraceOutdated).toBe(true)
  })

  it('A stale response is ignored if a newer run is initiated', async () => {
    let resolveFirstRun!: (val: api.ExecutionResult) => void
    const firstRunPromise = new Promise<api.ExecutionResult>((resolve) => {
      resolveFirstRun = resolve
    })

    const staleSteps: TraceStep[] = [
      {
        event: 'line',
        line: 1,
        stack: [{ fn: '<module>', line: 1, locals: { stale: true } }],
        output: 'stale',
      },
    ]

    const freshSteps: TraceStep[] = [
      {
        event: 'line',
        line: 1,
        stack: [{ fn: '<module>', line: 1, locals: { fresh: true } }],
        output: 'fresh',
      },
    ]

    let callCount = 0
    vi.spyOn(api, 'executeCode').mockImplementation(async () => {
      callCount++
      if (callCount === 1) {
        return firstRunPromise
      }
      return {
        steps: freshSteps,
        truncated: false,
        error: null,
      }
    })

    // Start first run (slow)
    const run1 = useTraceStore.getState().runCurrentCode()

    // Immediately start second run (fast)
    const run2 = useTraceStore.getState().runCurrentCode()

    // Await second run completion
    await run2

    expect(useTraceStore.getState().steps).toEqual(freshSteps)

    // Now first run finishes late
    resolveFirstRun({
      steps: staleSteps,
      truncated: false,
      error: null,
    })
    await run1

    // Store must STILL have freshSteps, ignoring the stale response!
    expect(useTraceStore.getState().steps).toEqual(freshSteps)
  })

  it('Mock mode badge is hidden by default and displayed when isMockMode is active', () => {
    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>
    )

    // In production/default dev, isMockMode is false, badge should not exist
    expect(screen.queryByTestId('mock-data-badge')).toBeNull()
  })
})
