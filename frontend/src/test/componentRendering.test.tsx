import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import fs from 'fs'
import path from 'path'

import { VariablesTable } from '@/components/workspace/VariablesTable'
import { CallStack } from '@/components/workspace/CallStack'
import { MemoryHeap } from '@/components/workspace/MemoryHeap'
import { OutputTerminal } from '@/components/workspace/OutputTerminal'
import { WorkspacePage } from '@/routes/WorkspacePage'
import { useTraceStore } from '@/store/useTraceStore'

// Mock Monaco Editor for jsdom environment
vi.mock('@monaco-editor/react', () => ({
  default: ({ code }: { code: string }) => (
    <div data-testid="monaco-editor-mock">
      <pre>{code}</pre>
    </div>
  ),
}))

function loadFixture(filename: string) {
  const fixturePath = path.resolve(import.meta.dirname, '../../../tests-e2e/fixtures', filename)
  const raw = fs.readFileSync(fixturePath, 'utf-8')
  return JSON.parse(raw)
}

describe('Component Rendering with Real Corpus Fixtures', () => {
  it('renders VariablesTable with fixture variables and type badges', () => {
    const fixture = loadFixture('a01_variable_assignment.json')
    const lastStep = fixture.data.steps[fixture.data.steps.length - 1]
    const locals = lastStep.stack[lastStep.stack.length - 1].locals

    render(<VariablesTable locals={locals} mutatedVariable={lastStep.mutatedVariable} />)

    // Check variable keys render
    expect(screen.getByText('x')).toBeInTheDocument()
    expect(screen.getByText('y')).toBeInTheDocument()
    expect(screen.getByText('z')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('is_active')).toBeInTheDocument()

    // Check values render
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('"CodeTrace"')).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
  })

  it('renders CallStack with multiple recursion frames', () => {
    const fixture = loadFixture('d02_fibonacci.json')
    // Find a step with depth 4+
    const deepStep = fixture.data.steps.find((s: any) => s.stack.length >= 4)
    expect(deepStep).toBeDefined()

    render(<CallStack stack={deepStep.stack} event={deepStep.event} />)

    expect(screen.getByText(`Depth ${deepStep.stack.length}`)).toBeInTheDocument()
    expect(screen.getAllByText('fib()').length).toBeGreaterThanOrEqual(3)
  })

  it('renders MemoryHeap with heap list cells and dict cells', () => {
    const fixture = loadFixture('b01_list_operations.json')
    const lastStep = fixture.data.steps[fixture.data.steps.length - 1]
    expect(lastStep.heapObjects.length).toBeGreaterThan(0)

    render(
      <MemoryHeap
        objects={lastStep.heapObjects}
        locals={lastStep.stack[lastStep.stack.length - 1].locals}
      />
    )

    expect(screen.getByText(/HEAP_ADDR_SPACE/i)).toBeInTheDocument()
    expect(screen.getByText(lastStep.heapObjects[0].address)).toBeInTheDocument()
  })

  it('renders shared references and pointer arrows in MemoryHeap for f04_shared_references', () => {
    const fixture = loadFixture('f04_shared_references.json')
    // Find step where both a and b point to the same list
    const sharedStep = fixture.data.steps.find(
      (s: any) => s.stack[0]?.locals?.a && s.stack[0]?.locals?.b
    )
    expect(sharedStep).toBeDefined()

    render(
      <MemoryHeap
        objects={sharedStep.heapObjects}
        locals={sharedStep.stack[0].locals}
      />
    )

    // Verify shared reference badge is rendered
    expect(screen.getByTestId('shared-reference-badge')).toBeInTheDocument()
    expect(screen.getByText(/Shared: a = b/i)).toBeInTheDocument()

    // Verify reference pointer arrows for both variables render
    expect(screen.getByTestId('ref-arrow-a')).toBeInTheDocument()
    expect(screen.getByTestId('ref-arrow-b')).toBeInTheDocument()
  })

  it('renders OutputTerminal with stdout stream', () => {
    const fixture = loadFixture('a08_print_only.json')
    const lastStep = fixture.data.steps[fixture.data.steps.length - 1]

    render(
      <OutputTerminal
        stdout={lastStep.output}
        currentStep={fixture.data.steps.length - 1}
        totalSteps={fixture.data.steps.length}
      />
    )

    expect(screen.getByText(/Line 1: Welcome/i)).toBeInTheDocument()
    expect(screen.getByText(/Line 3: CodeTrace/i)).toBeInTheDocument()
  })

  it('renders Exception Notice on exception step in WorkspacePage', () => {
    const fixture = loadFixture('i03_zero_division.json')
    const store = useTraceStore.getState()
    store.setSteps(fixture.data.steps, fixture.data.truncated, fixture.data.error)

    // Jump to the exception step
    const excIdx = fixture.data.steps.findIndex((s: any) => s.event === 'exception')
    expect(excIdx).toBeGreaterThanOrEqual(0)
    store.setCurrentStep(excIdx)

    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('exception-notice')).toBeInTheDocument()
    expect(screen.getByText(/ZeroDivisionError: division by zero/i)).toBeInTheDocument()
  })

  it('renders Truncated Notice when execution reached step limit in WorkspacePage', () => {
    const fixture = loadFixture('i07_long_loop_over_2000.json')
    const store = useTraceStore.getState()
    store.setSteps(fixture.data.steps, fixture.data.truncated, fixture.data.error)

    render(
      <MemoryRouter>
        <WorkspacePage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('truncated-notice')).toBeInTheDocument()
    expect(screen.getByText(/Execution exceeded the maximum step threshold/i)).toBeInTheDocument()
  })
})
