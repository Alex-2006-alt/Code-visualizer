import { TraceStep, TracePreset } from '@/types/trace'

export const FACTORIAL_CODE = `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

res = factorial(3)
print(res)`

export const FACTORIAL_STEPS: TraceStep[] = [
  {
    event: 'line',
    line: 6,
    stack: [{ fn: '<module>', line: 6, locals: {} }],
    output: '',
    explanation: 'Calling factorial(3) from module scope.',
  },
  {
    event: 'call',
    line: 1,
    stack: [
      { fn: '<module>', line: 6, locals: {} },
      { fn: 'factorial', line: 1, locals: { n: 3 } },
    ],
    output: '',
    explanation: 'Entered factorial frame with argument n = 3.',
  },
  {
    event: 'line',
    line: 2,
    stack: [
      { fn: '<module>', line: 6, locals: {} },
      { fn: 'factorial', line: 2, locals: { n: 3 } },
    ],
    output: '',
    predict: {
      id: 'fact-1',
      prompt: 'Will n <= 1 evaluate to True or False for n = 3?',
      options: ['True (Base case reached)', 'False (Recurse deeper)', 'SyntaxError'],
      correctIndex: 1,
      explanation: '3 <= 1 is False, so execution continues to recursive branch on line 4.',
    },
    explanation: 'Checking base case: 3 <= 1 evaluates to False.',
  },
  {
    event: 'line',
    line: 4,
    stack: [
      { fn: '<module>', line: 6, locals: {} },
      { fn: 'factorial', line: 4, locals: { n: 3 } },
    ],
    output: '',
    explanation: 'Evaluating 3 * factorial(2). Invoking recursive call.',
  },
  {
    event: 'call',
    line: 1,
    stack: [
      { fn: '<module>', line: 6, locals: {} },
      { fn: 'factorial', line: 4, locals: { n: 3 } },
      { fn: 'factorial', line: 1, locals: { n: 2 } },
    ],
    output: '',
    explanation: 'Pushed new stack frame factorial(n=2). Stack depth: 3.',
  },
  {
    event: 'line',
    line: 2,
    stack: [
      { fn: '<module>', line: 6, locals: {} },
      { fn: 'factorial', line: 4, locals: { n: 3 } },
      { fn: 'factorial', line: 2, locals: { n: 2 } },
    ],
    output: '',
    explanation: 'Checking base case: 2 <= 1 evaluates to False.',
  },
  {
    event: 'line',
    line: 4,
    stack: [
      { fn: '<module>', line: 6, locals: {} },
      { fn: 'factorial', line: 4, locals: { n: 3 } },
      { fn: 'factorial', line: 4, locals: { n: 2 } },
    ],
    output: '',
    explanation: 'Evaluating 2 * factorial(1). Invoking recursive call.',
  },
  {
    event: 'call',
    line: 1,
    stack: [
      { fn: '<module>', line: 6, locals: {} },
      { fn: 'factorial', line: 4, locals: { n: 3 } },
      { fn: 'factorial', line: 4, locals: { n: 2 } },
      { fn: 'factorial', line: 1, locals: { n: 1 } },
    ],
    output: '',
    explanation: 'Pushed new stack frame factorial(n=1). Base case argument reached!',
  },
  {
    event: 'line',
    line: 2,
    stack: [
      { fn: '<module>', line: 6, locals: {} },
      { fn: 'factorial', line: 4, locals: { n: 3 } },
      { fn: 'factorial', line: 4, locals: { n: 2 } },
      { fn: 'factorial', line: 2, locals: { n: 1 } },
    ],
    output: '',
    predict: {
      id: 'fact-2',
      prompt: 'What will line 2 evaluate to for n = 1?',
      options: ['True: return 1 immediately', 'False: recurse to factorial(0)', 'RecursionError'],
      correctIndex: 0,
      explanation: '1 <= 1 is True! This activates the base case and unwinds the stack.',
    },
    explanation: 'Checking base case: 1 <= 1 evaluates to True.',
  },
  {
    event: 'return',
    line: 3,
    ret: 1,
    stack: [
      { fn: '<module>', line: 6, locals: {} },
      { fn: 'factorial', line: 4, locals: { n: 3 } },
      { fn: 'factorial', line: 4, locals: { n: 2 } },
      { fn: 'factorial', line: 3, locals: { n: 1 } },
    ],
    output: '',
    explanation: 'Base case returns 1. Popping top stack frame.',
  },
  {
    event: 'return',
    line: 4,
    ret: 2,
    stack: [
      { fn: '<module>', line: 6, locals: {} },
      { fn: 'factorial', line: 4, locals: { n: 3 } },
      { fn: 'factorial', line: 4, locals: { n: 2 } },
    ],
    output: '',
    explanation: 'Computing 2 * 1 = 2. Returning 2 to caller.',
  },
  {
    event: 'return',
    line: 4,
    ret: 6,
    stack: [
      { fn: '<module>', line: 6, locals: {} },
      { fn: 'factorial', line: 4, locals: { n: 3 } },
    ],
    output: '',
    explanation: 'Computing 3 * 2 = 6. Returning 6 to <module>.',
  },
  {
    event: 'line',
    line: 7,
    stack: [{ fn: '<module>', line: 7, locals: { res: 6 } }],
    output: '6\n',
    mutatedVariable: 'res',
    explanation: 'print(res) outputs 6. Execution completed successfully.',
  },
]

export const FACTORIAL_PRESET: TracePreset = {
  id: 'factorial-recursion',
  title: 'Factorial Recursion',
  category: 'Recursion',
  difficulty: 'Easy',
  code: FACTORIAL_CODE,
  steps: FACTORIAL_STEPS,
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
}
