import { describe, it, expect, beforeEach } from 'vitest'
import { useTraceStore } from '../store/useTraceStore'
import { TraceStep } from '../types/trace'

function createMockStep(
  line: number,
  depth: number,
  event: 'line' | 'call' | 'return' | 'exception' = 'line',
  fnName: string = '<module>'
): TraceStep {
  const stack = Array.from({ length: depth }, (_, i) => ({
    fn: i === 0 ? '<module>' : i === depth - 1 ? fnName : `helper_${i}`,
    line: line,
    locals: { x: i },
  }))
  return {
    line,
    event,
    stack,
    heap: {},
    heapObjects: [],
    output: '',
  }
}

describe('Debugger-Style Controls (useTraceStore)', () => {
  beforeEach(() => {
    useTraceStore.getState().resetExecution()
  })

  describe('Breakpoint Management', () => {
    it('toggles breakpoints on and off correctly', () => {
      const store = useTraceStore.getState()
      expect(store.breakpoints).toEqual([])

      store.toggleBreakpoint(10)
      expect(useTraceStore.getState().breakpoints).toEqual([10])

      store.toggleBreakpoint(25)
      expect(useTraceStore.getState().breakpoints).toEqual([10, 25])

      // Toggling 10 again removes it
      store.toggleBreakpoint(10)
      expect(useTraceStore.getState().breakpoints).toEqual([25])

      // Clear breakpoints
      store.clearBreakpoints()
      expect(useTraceStore.getState().breakpoints).toEqual([])
    })

    it('clears breakpoints when setCode is called', () => {
      const store = useTraceStore.getState()
      store.toggleBreakpoint(5)
      expect(useTraceStore.getState().breakpoints).toEqual([5])

      store.setCode('x = 42\n')
      expect(useTraceStore.getState().breakpoints).toEqual([])
    })
  })

  describe('Step Into', () => {
    it('advances exactly one step', () => {
      const steps: TraceStep[] = [
        createMockStep(1, 1),
        createMockStep(2, 1),
        createMockStep(3, 1),
      ]
      const store = useTraceStore.getState()
      store.setSteps(steps)

      expect(useTraceStore.getState().currentStep).toBe(0)
      store.stepInto()
      expect(useTraceStore.getState().currentStep).toBe(1)
      store.stepInto()
      expect(useTraceStore.getState().currentStep).toBe(2)
      // Clamped at end
      store.stepInto()
      expect(useTraceStore.getState().currentStep).toBe(2)
    })

    it('handles empty trace gracefully without error', () => {
      const store = useTraceStore.getState()
      expect(store.steps.length).toBe(0)
      expect(() => store.stepInto()).not.toThrow()
      expect(store.currentStep).toBe(0)
    })
  })

  describe('Step Over on Loops and Nested Calls', () => {
    it('steps over a loop body iteration step-by-step when at same depth', () => {
      // Loop trace at depth 1: line 2 -> 3 -> 2 -> 3 -> 4
      const steps: TraceStep[] = [
        createMockStep(1, 1),
        createMockStep(2, 1),
        createMockStep(3, 1),
        createMockStep(2, 1),
        createMockStep(3, 1),
        createMockStep(4, 1),
      ]
      const store = useTraceStore.getState()
      store.setSteps(steps)

      store.stepOver()
      expect(useTraceStore.getState().currentStep).toBe(1)
      store.stepOver()
      expect(useTraceStore.getState().currentStep).toBe(2)
    })

    it('steps completely over a nested function call block', () => {
      // Top level at step 1 calls helper (steps 2-5 at depth 2), returning at step 6 (depth 1)
      const steps: TraceStep[] = [
        createMockStep(1, 1), // 0: module
        createMockStep(5, 1), // 1: call helper() -> depth 1
        createMockStep(10, 2, 'call', 'helper'), // 2: inside helper
        createMockStep(11, 2, 'line', 'helper'), // 3: inside helper
        createMockStep(12, 2, 'line', 'helper'), // 4: inside helper
        createMockStep(12, 2, 'return', 'helper'), // 5: returning
        createMockStep(6, 1), // 6: back in module
        createMockStep(7, 1), // 7: module end
      ]
      const store = useTraceStore.getState()
      store.setSteps(steps)

      store.setCurrentStep(1) // at line 5 (depth 1)
      expect(useTraceStore.getState().currentStep).toBe(1)

      // Step over should jump past helper execution (depth 2) to step 6 (depth 1)
      store.stepOver()
      expect(useTraceStore.getState().currentStep).toBe(6)
    })

    it('steps over to the end if no subsequent step at same/shallower depth exists', () => {
      const steps: TraceStep[] = [
        createMockStep(1, 1),
        createMockStep(2, 2, 'call', 'helper'),
        createMockStep(3, 3, 'call', 'sub_helper'),
      ]
      const store = useTraceStore.getState()
      store.setSteps(steps)
      store.setCurrentStep(1) // depth 2

      store.stepOver() // next step is depth 3, none <= 2, so stops at last step (index 2)
      expect(useTraceStore.getState().currentStep).toBe(2)
    })
  })

  describe('Step Out from Recursion (Depth 5)', () => {
    it('steps out of recursive frames to the caller frame with depth < current depth', () => {
      // Recursive factorial: module (depth 1) -> fact(5) -> fact(4) -> fact(3) -> fact(2) -> fact(1)
      const steps: TraceStep[] = [
        createMockStep(1, 1), // 0: module
        createMockStep(10, 2, 'call', 'fact'), // 1: depth 2
        createMockStep(10, 3, 'call', 'fact'), // 2: depth 3
        createMockStep(10, 4, 'call', 'fact'), // 3: depth 4
        createMockStep(10, 5, 'call', 'fact'), // 4: depth 5
        createMockStep(12, 5, 'line', 'fact'), // 5: base case reached
        createMockStep(13, 5, 'return', 'fact'), // 6: return from depth 5
        createMockStep(14, 4, 'return', 'fact'), // 7: return from depth 4
        createMockStep(14, 3, 'return', 'fact'), // 8: return from depth 3
        createMockStep(14, 2, 'return', 'fact'), // 9: return from depth 2
        createMockStep(2, 1), // 10: back to module
      ]
      const store = useTraceStore.getState()
      store.setSteps(steps)

      // Start at deepest frame (step 5, depth 5)
      store.setCurrentStep(5)
      expect(useTraceStore.getState().currentStep).toBe(5)

      // Step out: finds first step where stack.length < 5, which is step 7 (depth 4)
      store.stepOut()
      expect(useTraceStore.getState().currentStep).toBe(7)
      expect(useTraceStore.getState().steps[7].stack.length).toBe(4)

      // Step out again: finds step where stack.length < 4, which is step 8 (depth 3)
      store.stepOut()
      expect(useTraceStore.getState().currentStep).toBe(8)
      expect(useTraceStore.getState().steps[8].stack.length).toBe(3)
    })

    it('stays at end or current if already at top-level frame (depth 1)', () => {
      const steps: TraceStep[] = [
        createMockStep(1, 1),
        createMockStep(2, 1),
        createMockStep(3, 1),
      ]
      const store = useTraceStore.getState()
      store.setSteps(steps)
      store.setCurrentStep(0)

      // At depth 1, no step has depth < 1, so it seeks to end of trace
      store.stepOut()
      expect(useTraceStore.getState().currentStep).toBe(2)
    })
  })

  describe('Next Call Event', () => {
    it('jumps forward to the next step with event === call', () => {
      const steps: TraceStep[] = [
        createMockStep(1, 1, 'line'), // 0
        createMockStep(2, 1, 'line'), // 1
        createMockStep(10, 2, 'call', 'foo'), // 2
        createMockStep(11, 2, 'line', 'foo'), // 3
        createMockStep(20, 3, 'call', 'bar'), // 4
        createMockStep(21, 3, 'line', 'bar'), // 5
      ]
      const store = useTraceStore.getState()
      store.setSteps(steps)

      store.nextCall()
      expect(useTraceStore.getState().currentStep).toBe(2)

      store.nextCall()
      expect(useTraceStore.getState().currentStep).toBe(4)

      // No more calls -> jumps to last step or stays
      store.nextCall()
      expect(useTraceStore.getState().currentStep).toBe(5)
    })
  })

  describe('Continue to Breakpoint and Restart', () => {
    it('continues forward to the next step on a breakpoint line', () => {
      const steps: TraceStep[] = [
        createMockStep(1, 1), // 0
        createMockStep(2, 1), // 1
        createMockStep(3, 1), // 2
        createMockStep(4, 1), // 3: BREAKPOINT
        createMockStep(5, 1), // 4
        createMockStep(6, 1), // 5: BREAKPOINT
        createMockStep(7, 1), // 6
      ]
      const store = useTraceStore.getState()
      store.setSteps(steps)
      store.toggleBreakpoint(4)
      store.toggleBreakpoint(6)

      expect(useTraceStore.getState().currentStep).toBe(0)

      // Continue stops at line 4 (step 3)
      store.continueToBreakpoint()
      expect(useTraceStore.getState().currentStep).toBe(3)
      expect(useTraceStore.getState().steps[3].line).toBe(4)

      // Continue again stops at line 6 (step 5)
      store.continueToBreakpoint()
      expect(useTraceStore.getState().currentStep).toBe(5)
      expect(useTraceStore.getState().steps[5].line).toBe(6)

      // Continue again (no further breakpoints) runs to the end
      store.continueToBreakpoint()
      expect(useTraceStore.getState().currentStep).toBe(6)
    })

    it('restarts trace execution cleanly back to step 0', () => {
      const steps: TraceStep[] = [
        createMockStep(1, 1),
        createMockStep(2, 1),
        createMockStep(3, 1),
      ]
      const store = useTraceStore.getState()
      store.setSteps(steps)
      store.setCurrentStep(2)
      expect(useTraceStore.getState().currentStep).toBe(2)

      store.restart()
      expect(useTraceStore.getState().currentStep).toBe(0)
    })
  })
})
