import { TraceStep, TracePreset } from '@/types/trace'

export const BUBBLE_SORT_CODE = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

nums = [5, 2, 8, 1]
res = bubble_sort(nums)`

export const BUBBLE_SORT_STEPS: TraceStep[] = [
  {
    event: 'line',
    line: 9,
    stack: [{ fn: '<module>', line: 9, locals: {} }],
    output: '',
    heapObjects: [
      {
        id: 'heap-arr',
        type: 'list',
        address: '0x7ffe9210',
        value: [5, 2, 8, 1],
        label: 'nums',
      },
    ],
    explanation: 'Initialized list nums = [5, 2, 8, 1] at 0x7ffe9210.',
  },
  {
    event: 'line',
    line: 10,
    stack: [{ fn: '<module>', line: 10, locals: { nums: [5, 2, 8, 1] } }],
    output: '',
    heapObjects: [
      {
        id: 'heap-arr',
        type: 'list',
        address: '0x7ffe9210',
        value: [5, 2, 8, 1],
        label: 'nums',
      },
    ],
    explanation: 'Invoking bubble_sort(nums).',
  },
  {
    event: 'call',
    line: 1,
    stack: [
      { fn: '<module>', line: 10, locals: { nums: [5, 2, 8, 1] } },
      { fn: 'bubble_sort', line: 1, locals: { arr: [5, 2, 8, 1] } },
    ],
    output: '',
    heapObjects: [
      {
        id: 'heap-arr',
        type: 'list',
        address: '0x7ffe9210',
        value: [5, 2, 8, 1],
        label: 'arr (ref)',
      },
    ],
    explanation: 'Entering bubble_sort frame. Parameter arr points to 0x7ffe9210.',
  },
  {
    event: 'line',
    line: 2,
    stack: [
      { fn: '<module>', line: 10, locals: { nums: [5, 2, 8, 1] } },
      { fn: 'bubble_sort', line: 2, locals: { arr: [5, 2, 8, 1], n: 4 } },
    ],
    output: '',
    mutatedVariable: 'n',
    heapObjects: [
      {
        id: 'heap-arr',
        type: 'list',
        address: '0x7ffe9210',
        value: [5, 2, 8, 1],
        label: 'arr',
      },
    ],
    explanation: 'Computed length: n = 4.',
  },
  {
    event: 'line',
    line: 3,
    stack: [
      { fn: '<module>', line: 10, locals: { nums: [5, 2, 8, 1] } },
      { fn: 'bubble_sort', line: 3, locals: { arr: [5, 2, 8, 1], n: 4, i: 0 } },
    ],
    output: '',
    mutatedVariable: 'i',
    heapObjects: [
      {
        id: 'heap-arr',
        type: 'list',
        address: '0x7ffe9210',
        value: [5, 2, 8, 1],
        label: 'arr',
      },
    ],
    explanation: 'Starting outer loop pass: i = 0.',
  },
  {
    event: 'line',
    line: 4,
    stack: [
      { fn: '<module>', line: 10, locals: { nums: [5, 2, 8, 1] } },
      { fn: 'bubble_sort', line: 4, locals: { arr: [5, 2, 8, 1], n: 4, i: 0, j: 0 } },
    ],
    output: '',
    mutatedVariable: 'j',
    heapObjects: [
      {
        id: 'heap-arr',
        type: 'list',
        address: '0x7ffe9210',
        value: [5, 2, 8, 1],
        targetIndex: 0,
        label: 'arr',
      },
    ],
    explanation: 'Inner comparison: comparing arr[0] (5) and arr[1] (2).',
  },
  {
    event: 'line',
    line: 5,
    stack: [
      { fn: '<module>', line: 10, locals: { nums: [5, 2, 8, 1] } },
      { fn: 'bubble_sort', line: 5, locals: { arr: [5, 2, 8, 1], n: 4, i: 0, j: 0 } },
    ],
    output: '',
    predict: {
      id: 'bubble-1',
      prompt: 'Is arr[0] (5) > arr[1] (2)? Will a swap occur?',
      options: ['Yes: 5 > 2, swap elements', 'No: already ordered', 'IndexError'],
      correctIndex: 0,
      explanation: '5 > 2 evaluates to True, so a swap is executed on line 6.',
    },
    heapObjects: [
      {
        id: 'heap-arr',
        type: 'list',
        address: '0x7ffe9210',
        value: [5, 2, 8, 1],
        targetIndex: 0,
        label: 'arr (5 > 2 ?)',
      },
    ],
    explanation: '5 > 2 evaluates True. Proceeding to swap.',
  },
  {
    event: 'line',
    line: 6,
    stack: [
      { fn: '<module>', line: 10, locals: { nums: [2, 5, 8, 1] } },
      { fn: 'bubble_sort', line: 6, locals: { arr: [2, 5, 8, 1], n: 4, i: 0, j: 0 } },
    ],
    output: '',
    mutatedVariable: 'arr',
    heapObjects: [
      {
        id: 'heap-arr',
        type: 'list',
        address: '0x7ffe9210',
        value: [2, 5, 8, 1],
        targetIndex: 1,
        label: 'arr (swapped!)',
      },
    ],
    explanation: 'Swapped! Array mutated in-place: [2, 5, 8, 1].',
  },
  {
    event: 'line',
    line: 4,
    stack: [
      { fn: '<module>', line: 10, locals: { nums: [2, 5, 8, 1] } },
      { fn: 'bubble_sort', line: 4, locals: { arr: [2, 5, 8, 1], n: 4, i: 0, j: 1 } },
    ],
    output: '',
    mutatedVariable: 'j',
    heapObjects: [
      {
        id: 'heap-arr',
        type: 'list',
        address: '0x7ffe9210',
        value: [2, 5, 8, 1],
        targetIndex: 1,
        label: 'arr',
      },
    ],
    explanation: 'Next pair: j = 1, comparing arr[1] (5) and arr[2] (8).',
  },
  {
    event: 'line',
    line: 5,
    stack: [
      { fn: '<module>', line: 10, locals: { nums: [2, 5, 8, 1] } },
      { fn: 'bubble_sort', line: 5, locals: { arr: [2, 5, 8, 1], n: 4, i: 0, j: 1 } },
    ],
    output: '',
    heapObjects: [
      {
        id: 'heap-arr',
        type: 'list',
        address: '0x7ffe9210',
        value: [2, 5, 8, 1],
        targetIndex: 1,
        label: 'arr',
      },
    ],
    explanation: '5 > 8 evaluates False. No swap needed.',
  },
  {
    event: 'return',
    line: 7,
    ret: [1, 2, 5, 8],
    stack: [
      { fn: '<module>', line: 10, locals: { nums: [1, 2, 5, 8] } },
      { fn: 'bubble_sort', line: 7, locals: { arr: [1, 2, 5, 8], n: 4, i: 3 } },
    ],
    output: '',
    heapObjects: [
      {
        id: 'heap-arr',
        type: 'list',
        address: '0x7ffe9210',
        value: [1, 2, 5, 8],
        label: 'arr (sorted)',
      },
    ],
    explanation: 'All passes complete. Returning sorted list [1, 2, 5, 8].',
  },
]

export const BUBBLE_SORT_PRESET: TracePreset = {
  id: 'bubble-sort',
  title: 'Bubble Sort',
  category: 'Sorting',
  difficulty: 'Easy',
  code: BUBBLE_SORT_CODE,
  steps: BUBBLE_SORT_STEPS,
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
}
