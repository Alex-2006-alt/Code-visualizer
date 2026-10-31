import { describe, it, expect } from 'vitest'
import {
  buildAddressLabelMap,
  formatVariableValue,
  generateStepExplanation,
} from '@/lib/formatters'
import { TraceStep } from '@/types/trace'

describe('Formatters & Reference Labels', () => {
  it('assigns stable @1, @2 reference labels in order of first appearance', () => {
    const steps: TraceStep[] = [
      {
        event: 'line',
        line: 1,
        stack: [{ fn: '<module>', line: 1, locals: { a: 'ref -> 0xAAA' } }],
        output: '',
      },
      {
        event: 'line',
        line: 2,
        stack: [
          {
            fn: '<module>',
            line: 2,
            locals: { a: 'ref -> 0xAAA', b: 'ref -> 0xBBB', c: 'ref -> 0xAAA' },
          },
        ],
        output: '',
      },
      {
        event: 'line',
        line: 3,
        stack: [{ fn: '<module>', line: 3, locals: { d: 'ref -> 0xCCC' } }],
        output: '',
      },
    ]

    const addressLabels = buildAddressLabelMap(steps)
    expect(addressLabels.get('0xaaa')).toBe('@1')
    expect(addressLabels.get('0xbbb')).toBe('@2')
    expect(addressLabels.get('0xccc')).toBe('@3')
  })

  it('formats primitives using Python wording', () => {
    expect(formatVariableValue(null).preview).toBe('None')
    expect(formatVariableValue(undefined).preview).toBe('None')
    expect(formatVariableValue(true).preview).toBe('True')
    expect(formatVariableValue(false).preview).toBe('False')
    expect(formatVariableValue(42).preview).toBe('42')
    expect(formatVariableValue(3.14).preview).toBe('3.14')
    expect(formatVariableValue('hello').preview).toBe('"hello"')
  })

  it('formats functions cleanly without heap cards', () => {
    const res = formatVariableValue('function two_sum(nums, target)')
    expect(res.preview).toBe('function two_sum(nums, target)')
    expect(res.refAddress).toBeUndefined()
  })

  it('formats reference lists, dicts, sets, and instances with compact preview and label tag', () => {
    const addressLabels = new Map([
      ['0x123', '@1'],
      ['0x456', '@2'],
    ])
    const heapObjects = [
      {
        id: '1',
        type: 'list' as const,
        address: '0x123',
        value: [2, 8, 11, 15],
      },
      {
        id: '2',
        type: 'dict' as const,
        address: '0x456',
        value: { a: 1, b: 2 },
      },
    ]

    // List ref
    const listRes = formatVariableValue('ref -> 0x123', undefined, heapObjects, addressLabels)
    expect(listRes.preview).toBe('[2, 8, 11, 15]')
    expect(listRes.refLabel).toBe('@1')
    expect(listRes.refAddress).toBe('0x123')

    // Dict ref
    const dictRes = formatVariableValue('ref -> 0x456', undefined, heapObjects, addressLabels)
    expect(dictRes.preview).toBe("{'a': 1, 'b': 2}")
    expect(dictRes.refLabel).toBe('@2')
  })

  it('formats empty containers cleanly', () => {
    const heapObjects = [
      { id: '1', type: 'list' as const, address: '0x10', value: [] },
      { id: '2', type: 'dict' as const, address: '0x20', value: {} },
    ]
    const emptyList = formatVariableValue('ref -> 0x10', undefined, heapObjects)
    expect(emptyList.preview).toBe('[]')

    const emptyDict = formatVariableValue('ref -> 0x20', undefined, heapObjects)
    expect(emptyDict.preview).toBe('{}')
  })

  it('generates real step explanations from execution without canned text or "Returned null"', () => {
    const sourceCode = [
      'def two_sum(nums, target):',
      '    seen = {}',
      '    return [0, 1]',
      'numbers = [2, 8, 11, 15]',
      'print(f"Indices: {numbers}")',
    ].join('\n')

    // Print step
    const printStep: TraceStep = {
      event: 'return',
      line: 5,
      stack: [{ fn: '<module>', line: 5, locals: {} }],
      output: 'Indices: [2, 8, 11, 15]',
      ret: null,
    }
    const printExpl = generateStepExplanation(printStep, sourceCode)
    expect(printExpl).toContain('outputs Indices: [2, 8, 11, 15]')
    expect(printExpl).not.toContain('null')
    expect(printExpl).not.toContain('Returned null')

    // Return step
    const returnStep: TraceStep = {
      event: 'return',
      line: 3,
      stack: [{ fn: 'two_sum', line: 3, locals: {} }],
      output: '',
      ret: [0, 1],
    }
    const returnExpl = generateStepExplanation(returnStep, sourceCode)
    expect(returnExpl).toContain('returns [0, 1]')
  })
})


import { render, screen } from '@testing-library/react'
import { ComplexityMeter } from '@/components/workspace/ComplexityMeter'

describe('ComplexityMeter Component', () => {
  it('renders flat code without functions with prompt to wrap in function', () => {
    const flatCode = 'x = 1\ny = 2\nprint(x + y)'
    render(
      <ComplexityMeter
        code={flatCode}
        currentStep={0}
        totalSteps={3}
      />
    )

    expect(screen.getByText(/Wrap your code in a function to measure its Big-O complexity/i)).toBeInTheDocument()
    expect(screen.queryByText(/Step Overhead/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Steps in this run:/i)).toBeInTheDocument()
  })

  it('detects functions in code and displays analyze controls', () => {
    const funcCode = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
`
    render(
      <ComplexityMeter
        code={funcCode}
        currentStep={5}
        totalSteps={13}
      />
    )

    expect(screen.getByText('two_sum()')).toBeInTheDocument()
    expect(screen.getByText('Analyze')).toBeInTheDocument()
    expect(screen.queryByText(/Step Overhead/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Steps in this run:/i)).toBeInTheDocument()
    expect(screen.getByText(/13 steps \(at #6\)/i)).toBeInTheDocument()
  })

  it('displays known badge when preset provides timeComplexity', () => {
    const preset = {
      id: 'two-sum',
      title: 'Two Sum',
      category: 'Array',
      difficulty: 'Easy' as const,
      code: 'def two_sum(nums, target): pass',
      steps: [],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
    }

    render(
      <ComplexityMeter
        code={preset.code}
        preset={preset}
        currentStep={0}
        totalSteps={0}
      />
    )

    expect(screen.getByText('T: O(n)')).toBeInTheDocument()
    expect(screen.getByText('S: O(n)')).toBeInTheDocument()
    expect(screen.getAllByText('Known').length).toBeGreaterThan(0)
  })
})
