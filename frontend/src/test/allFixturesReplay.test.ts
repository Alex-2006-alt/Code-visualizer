import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { useTraceStore } from '@/store/useTraceStore'

describe('All 80 Real Backend Fixtures Replay Suite', () => {
  const fixturesDir = path.resolve(import.meta.dirname, '../../../tests-e2e/fixtures')
  const fixtureFiles = fs.readdirSync(fixturesDir).filter((f) => f.endsWith('.json'))

  it('verifies that at least 60 fixtures are available (found 80)', () => {
    expect(fixtureFiles.length).toBeGreaterThanOrEqual(60)
  })

  // Test every fixture systematically
  for (const file of fixtureFiles) {
    const testName = file.replace('.json', '')

    it(`replays or validates fixture [${testName}] without errors`, () => {
      const raw = fs.readFileSync(path.join(fixturesDir, file), 'utf-8')
      const fixture = JSON.parse(raw)

      if (fixture.status_code === 200) {
        const data = fixture.data
        expect(data).toBeDefined()
        expect(Array.isArray(data.steps)).toBe(true)

        const steps = data.steps
        expect(steps.length).toBeGreaterThan(0)

        useTraceStore.getState().setSteps(steps, data.truncated, data.error)

        // 1. Initial step invariant
        expect(useTraceStore.getState().currentStep).toBe(0)
        expect(useTraceStore.getState().steps.length).toBe(steps.length)

        // 2. Check truncated consistency
        if (data.truncated || data.step_limit_reached) {
          expect(useTraceStore.getState().isTruncated).toBe(true)
        }

        // 3. Check navigation to middle and end
        const mid = Math.floor(steps.length / 2)
        useTraceStore.getState().setCurrentStep(mid)
        expect(useTraceStore.getState().currentStep).toBe(mid)

        useTraceStore.getState().setCurrentStep(steps.length - 1)
        expect(useTraceStore.getState().currentStep).toBe(steps.length - 1)

        // 4. Sample check on frames
        const lastStep = steps[steps.length - 1]
        expect(lastStep).toHaveProperty('line')
        expect(lastStep).toHaveProperty('stack')
        expect(Array.isArray(lastStep.stack)).toBe(true)

        // 5. If test is expected failure with runtime exception, verify exception step exists
        if (
          file.includes('zero_division') ||
          file.includes('index_error') ||
          file.includes('key_error') ||
          file.includes('name_error')
        ) {
          const hasException = steps.some((s: any) => s.event === 'exception')
          expect(hasException).toBe(true)
        }
      } else {
        // Compile-time / syntax / timeout / validation error fixture (e.g. 400, 408, 422, 503)
        expect([400, 408, 422, 503]).toContain(fixture.status_code)
        expect(fixture.data.detail).toBeDefined()
      }
    })
  }
})
