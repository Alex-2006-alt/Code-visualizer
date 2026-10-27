import { TraceStep, TracePreset } from '@/types/trace'

export const TWO_SUM_CODE = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

numbers = [2, 7, 11, 15]
res = two_sum(numbers, 9)
print(f"Indices: {res}")`

export const TWO_SUM_STEPS: TraceStep[] = [
  {
    event: 'line',
    line: 10,
    stack: [{ fn: '<module>', line: 10, locals: {} }],
    output: '',
    heapObjects: [
      {
        id: 'heap-nums',
        type: 'list',
        address: '0x7ffe82c0',
        value: [2, 7, 11, 15],
        label: 'numbers',
      },
    ],
    explanation: 'Binding input array numbers = [2, 7, 11, 15] at 0x7ffe82c0.',
  },
  {
    event: 'line',
    line: 11,
    stack: [{ fn: '<module>', line: 11, locals: { numbers: [2, 7, 11, 15] } }],
    output: '',
    heapObjects: [
      {
        id: 'heap-nums',
        type: 'list',
        address: '0x7ffe82c0',
        value: [2, 7, 11, 15],
        label: 'numbers',
      },
    ],
    explanation: 'Calling two_sum(numbers, target=9).',
  },
  {
    event: 'call',
    line: 1,
    stack: [
      { fn: '<module>', line: 11, locals: { numbers: [2, 7, 11, 15] } },
      { fn: 'two_sum', line: 1, locals: { nums: [2, 7, 11, 15], target: 9 } },
    ],
    output: '',
    heapObjects: [
      {
        id: 'heap-nums',
        type: 'list',
        address: '0x7ffe82c0',
        value: [2, 7, 11, 15],
        label: 'nums',
      },
    ],
    explanation: 'Entered two_sum frame. Parameters bound: nums and target=9.',
  },
  {
    event: 'line',
    line: 2,
    stack: [
      { fn: '<module>', line: 11, locals: { numbers: [2, 7, 11, 15] } },
      { fn: 'two_sum', line: 2, locals: { nums: [2, 7, 11, 15], target: 9, seen: {} } },
    ],
    output: '',
    mutatedVariable: 'seen',
    heapObjects: [
      {
        id: 'heap-nums',
        type: 'list',
        address: '0x7ffe82c0',
        value: [2, 7, 11, 15],
        label: 'nums',
      },
      {
        id: 'heap-dict',
        type: 'dict',
        address: '0x7ffe14a0',
        value: {},
        label: 'seen',
      },
    ],
    explanation: 'Initialized empty dictionary seen = {} at 0x7ffe14a0.',
  },
  {
    event: 'line',
    line: 3,
    stack: [
      { fn: '<module>', line: 11, locals: { numbers: [2, 7, 11, 15] } },
      {
        fn: 'two_sum',
        line: 3,
        locals: { nums: [2, 7, 11, 15], target: 9, seen: {}, i: 0, num: 2 },
      },
    ],
    output: '',
    mutatedVariable: 'num',
    heapObjects: [
      {
        id: 'heap-nums',
        type: 'list',
        address: '0x7ffe82c0',
        value: [2, 7, 11, 15],
        targetIndex: 0,
        label: 'nums [0]=2',
      },
      {
        id: 'heap-dict',
        type: 'dict',
        address: '0x7ffe14a0',
        value: {},
        label: 'seen',
      },
    ],
    explanation: 'Loop index 0: bound i = 0, num = 2.',
  },
  {
    event: 'line',
    line: 4,
    stack: [
      { fn: '<module>', line: 11, locals: { numbers: [2, 7, 11, 15] } },
      {
        fn: 'two_sum',
        line: 4,
        locals: { nums: [2, 7, 11, 15], target: 9, seen: {}, i: 0, num: 2, diff: 7 },
      },
    ],
    output: '',
    mutatedVariable: 'diff',
    heapObjects: [
      {
        id: 'heap-nums',
        type: 'list',
        address: '0x7ffe82c0',
        value: [2, 7, 11, 15],
        targetIndex: 0,
        label: 'nums',
      },
      {
        id: 'heap-dict',
        type: 'dict',
        address: '0x7ffe14a0',
        value: {},
        label: 'seen',
      },
    ],
    explanation: 'Calculated complement: diff = 9 - 2 = 7.',
  },
  {
    event: 'line',
    line: 5,
    stack: [
      { fn: '<module>', line: 11, locals: { numbers: [2, 7, 11, 15] } },
      {
        fn: 'two_sum',
        line: 5,
        locals: { nums: [2, 7, 11, 15], target: 9, seen: {}, i: 0, num: 2, diff: 7 },
      },
    ],
    output: '',
    predict: {
      id: 'two-sum-1',
      prompt: 'Is diff (7) in the hash map seen?',
      options: ['False (seen is empty)', 'True (found match)', 'TypeError'],
      correctIndex: 0,
      explanation: 'seen is currently empty {}, so 7 in seen evaluates to False.',
    },
    heapObjects: [
      {
        id: 'heap-nums',
        type: 'list',
        address: '0x7ffe82c0',
        value: [2, 7, 11, 15],
        label: 'nums',
      },
      {
        id: 'heap-dict',
        type: 'dict',
        address: '0x7ffe14a0',
        value: {},
        label: 'seen (empty)',
      },
    ],
    explanation: 'Checking "7 in seen": evaluates False. Skipping return.',
  },
  {
    event: 'line',
    line: 7,
    stack: [
      { fn: '<module>', line: 11, locals: { numbers: [2, 7, 11, 15] } },
      {
        fn: 'two_sum',
        line: 7,
        locals: { nums: [2, 7, 11, 15], target: 9, seen: { '2': 0 }, i: 0, num: 2, diff: 7 },
      },
    ],
    output: '',
    mutatedVariable: 'seen',
    heapObjects: [
      {
        id: 'heap-nums',
        type: 'list',
        address: '0x7ffe82c0',
        value: [2, 7, 11, 15],
        label: 'nums',
      },
      {
        id: 'heap-dict',
        type: 'dict',
        address: '0x7ffe14a0',
        value: { '2': 0 },
        label: 'seen[2] = 0',
      },
    ],
    explanation: 'Inserted seen[2] = 0 into hash table map.',
  },
  {
    event: 'line',
    line: 3,
    stack: [
      { fn: '<module>', line: 11, locals: { numbers: [2, 7, 11, 15] } },
      {
        fn: 'two_sum',
        line: 3,
        locals: { nums: [2, 7, 11, 15], target: 9, seen: { '2': 0 }, i: 1, num: 7 },
      },
    ],
    output: '',
    mutatedVariable: 'num',
    heapObjects: [
      {
        id: 'heap-nums',
        type: 'list',
        address: '0x7ffe82c0',
        value: [2, 7, 11, 15],
        targetIndex: 1,
        label: 'nums [1]=7',
      },
      {
        id: 'heap-dict',
        type: 'dict',
        address: '0x7ffe14a0',
        value: { '2': 0 },
        label: 'seen',
      },
    ],
    explanation: 'Loop index 1: bound i = 1, num = 7.',
  },
  {
    event: 'line',
    line: 4,
    stack: [
      { fn: '<module>', line: 11, locals: { numbers: [2, 7, 11, 15] } },
      {
        fn: 'two_sum',
        line: 4,
        locals: { nums: [2, 7, 11, 15], target: 9, seen: { '2': 0 }, i: 1, num: 7, diff: 2 },
      },
    ],
    output: '',
    mutatedVariable: 'diff',
    heapObjects: [
      {
        id: 'heap-nums',
        type: 'list',
        address: '0x7ffe82c0',
        value: [2, 7, 11, 15],
        targetIndex: 1,
        label: 'nums',
      },
      {
        id: 'heap-dict',
        type: 'dict',
        address: '0x7ffe14a0',
        value: { '2': 0 },
        label: 'seen',
      },
    ],
    explanation: 'Calculated complement: diff = 9 - 7 = 2.',
  },
  {
    event: 'line',
    line: 5,
    stack: [
      { fn: '<module>', line: 11, locals: { numbers: [2, 7, 11, 15] } },
      {
        fn: 'two_sum',
        line: 5,
        locals: { nums: [2, 7, 11, 15], target: 9, seen: { '2': 0 }, i: 1, num: 7, diff: 2 },
      },
    ],
    output: '',
    predict: {
      id: 'two-sum-2',
      prompt: 'Is diff (2) in seen? What is seen[2]?',
      options: ['True: seen[2] is 0, match found!', 'False: not found', 'IndexError'],
      correctIndex: 0,
      explanation: 'seen has key 2 mapped to index 0! 2 + 7 = 9. Solution found!',
    },
    heapObjects: [
      {
        id: 'heap-nums',
        type: 'list',
        address: '0x7ffe82c0',
        value: [2, 7, 11, 15],
        targetIndex: 1,
        label: 'nums',
      },
      {
        id: 'heap-dict',
        type: 'dict',
        address: '0x7ffe14a0',
        value: { '2': 0 },
        label: 'seen (2 -> 0)',
      },
    ],
    explanation: 'Lookup diff=2 in seen: HIT! Evaluates TRUE.',
  },
  {
    event: 'return',
    line: 6,
    ret: [0, 1],
    stack: [
      { fn: '<module>', line: 11, locals: { numbers: [2, 7, 11, 15] } },
      {
        fn: 'two_sum',
        line: 6,
        locals: { nums: [2, 7, 11, 15], target: 9, seen: { '2': 0 }, i: 1, num: 7, diff: 2 },
      },
    ],
    output: '',
    explanation: 'Returning [seen[2], 1] -> [0, 1]. Unwinding stack frame.',
  },
  {
    event: 'line',
    line: 12,
    stack: [{ fn: '<module>', line: 12, locals: { numbers: [2, 7, 11, 15], res: [0, 1] } }],
    output: 'Indices: [0, 1]\n',
    mutatedVariable: 'res',
    explanation: 'print(f"Indices: {res}") outputs "Indices: [0, 1]". Trace complete!',
  },
]

export const TWO_SUM_PRESET: TracePreset = {
  id: 'two-sum',
  title: 'Two Sum',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  code: TWO_SUM_CODE,
  steps: TWO_SUM_STEPS,
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
}
