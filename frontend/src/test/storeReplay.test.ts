import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { useTraceStore } from '@/store/useTraceStore'
import { TraceStep } from '@/types/trace'

function loadFixture(filename: string) {
  const fixturePath = path.resolve(import.meta.dirname, '../../../tests-e2e/fixtures', filename)
  const raw = fs.readFileSync(fixturePath, 'utf-8')
  return JSON.parse(raw)
}

describe('Frontend Store & Replay Logic Tests', () => {
  beforeEach(() => {
    useTraceStore.getState().resetExecution()
  })

  it('correctly loads and replays steps from a01_variable_assignment', () => {
    const fixture = loadFixture('a01_variable_assignment.json')
    const steps: TraceStep[] = fixture.data.steps
    expect(steps.length).toBeGreaterThan(0)

    const store = useTraceStore.getState()
    store.setSteps(steps, fixture.data.truncated, fixture.data.error)

    expect(useTraceStore.getState().currentStep).toBe(0)
    expect(useTraceStore.getState().steps.length).toBe(steps.length)
    expect(useTraceStore.getState().isTruncated).toBe(false)
    expect(useTraceStore.getState().executionError).toBeNull()

    // Step forward
    store.nextStep()
    expect(useTraceStore.getState().currentStep).toBe(1)

    // Step backward
    store.prevStep()
    expect(useTraceStore.getState().currentStep).toBe(0)

    // Clamping at zero
    store.prevStep()
    expect(useTraceStore.getState().currentStep).toBe(0)

    // Jump to middle and last step
    const mid = Math.floor(steps.length / 2)
    store.setCurrentStep(mid)
    expect(useTraceStore.getState().currentStep).toBe(mid)

    store.setCurrentStep(steps.length - 1)
    expect(useTraceStore.getState().currentStep).toBe(steps.length - 1)

    // Clamping at upper bound
    store.setCurrentStep(999999)
    expect(useTraceStore.getState().currentStep).toBe(steps.length - 1)
  })

  it('correctly handles recursion call stack depth in d02_fibonacci', () => {
    const fixture = loadFixture('d02_fibonacci.json')
    const steps: TraceStep[] = fixture.data.steps

    const store = useTraceStore.getState()
    store.setSteps(steps)

    // Find the step with maximum stack depth
    let maxDepth = 0
    let maxStepIdx = 0
    steps.forEach((step, idx) => {
      if (step.stack.length > maxDepth) {
        maxDepth = step.stack.length
        maxStepIdx = idx
      }
    })

    expect(maxDepth).toBeGreaterThan(2)

    store.setCurrentStep(maxStepIdx)
    const currentStepData = useTraceStore.getState().steps[useTraceStore.getState().currentStep]
    expect(currentStepData.stack.length).toBe(maxDepth)
    expect(currentStepData.stack[currentStepData.stack.length - 1].fn).toBe('fib')
  })

  it('correctly captures truncated state from i07_long_loop_over_2000', () => {
    const fixture = loadFixture('i07_long_loop_over_2000.json')
    const steps: TraceStep[] = fixture.data.steps

    const store = useTraceStore.getState()
    store.setSteps(steps, fixture.data.truncated, fixture.data.error)

    expect(useTraceStore.getState().isTruncated).toBe(true)
    expect(steps.length).toBe(2000)
  })

  it('correctly captures exception step and error from i03_zero_division', () => {
    const fixture = loadFixture('i03_zero_division.json')
    const steps: TraceStep[] = fixture.data.steps

    const store = useTraceStore.getState()
    store.setSteps(steps, fixture.data.truncated, fixture.data.error)

    expect(useTraceStore.getState().executionError).toBe('ZeroDivisionError: division by zero')

    const lastStep = steps[steps.length - 1]
    expect(lastStep.explanation).toContain('ZeroDivisionError')
  })
})
