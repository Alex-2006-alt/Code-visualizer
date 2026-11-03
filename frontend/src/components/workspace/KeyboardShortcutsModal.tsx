import React, { useState } from 'react'
import { Modal, GlassButton, Tabs } from '@/components/ui'
import { ALLOWED_MODULES } from '@/config/features'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'shortcuts' | 'modules'
}

interface ShortcutItem {
  keys: string[]
  action: string
  description: string
}

interface ModuleInfo {
  name: string
  category: string
  description: string
  example: string
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ['F10'],
    action: 'Step Over',
    description: 'Advance execution while staying in the current function scope (steps over calls).',
  },
  {
    keys: ['F11'],
    action: 'Step Into',
    description: 'Advance to the very next step, stepping inside function calls.',
  },
  {
    keys: ['Shift', 'F11'],
    action: 'Step Out',
    description: 'Advance execution until the current function returns to its caller.',
  },
  {
    keys: ['F8'],
    action: 'Continue',
    description: 'Run forward until the next armed breakpoint or the end of the trace.',
  },
  {
    keys: ['Space'],
    action: 'Play / Pause',
    description: 'Toggle auto-replay loop at the currently selected playback speed.',
  },
  {
    keys: ['←'],
    action: 'Step Backward',
    description: 'Go to the previous recorded step in the execution trace.',
  },
  {
    keys: ['→'],
    action: 'Step Forward',
    description: 'Go to the next recorded step in the execution trace.',
  },
  {
    keys: ['Click Gutter'],
    action: 'Toggle Breakpoint',
    description: 'Click next to any line number in the code editor to arm or disarm a breakpoint.',
  },
]

const MODULE_DETAILS: Record<string, ModuleInfo> = {
  math: {
    name: 'math',
    category: 'Math & Numbers',
    description: 'Standard mathematical functions: sqrt, pow, sin, cos, floor, ceil, pi, e, gcd.',
    example: 'import math\nval = math.sqrt(64) + math.gcd(12, 18)',
  },
  cmath: {
    name: 'cmath',
    category: 'Math & Numbers',
    description: 'Mathematical functions for complex numbers: sqrt, phase, polar, rect.',
    example: 'import cmath\nz = cmath.sqrt(-4)',
  },
  fractions: {
    name: 'fractions',
    category: 'Math & Numbers',
    description: 'Exact rational arithmetic without floating point imprecision.',
    example: 'from fractions import Fraction\nr = Fraction(1, 3) + Fraction(1, 6)',
  },
  statistics: {
    name: 'statistics',
    category: 'Math & Numbers',
    description: 'Mathematical statistics: mean, median, mode, stdev, variance, quantiles.',
    example: 'import statistics\navg = statistics.mean([10, 20, 30, 40])',
  },
  random: {
    name: 'random',
    category: 'Math & Numbers',
    description: 'Pseudo-random number generation: randint, choice, sample, shuffle.',
    example: 'import random\nval = random.randint(1, 100)',
  },
  collections: {
    name: 'collections',
    category: 'Collections & Data',
    description: 'High-performance specialized container datatypes: deque, Counter, OrderedDict, defaultdict, namedtuple.',
    example: 'from collections import deque, Counter\nq = deque([1, 2, 3])\ncounts = Counter("banana")',
  },
  itertools: {
    name: 'itertools',
    category: 'Collections & Data',
    description: 'Iterator building blocks: permutations, combinations, product, accumulate, chain, cycle.',
    example: 'import itertools\npairs = list(itertools.combinations([1, 2, 3], 2))',
  },
  heapq: {
    name: 'heapq',
    category: 'Collections & Data',
    description: 'Heap queue algorithm (min-heap priority queue): heappush, heappop, heapify.',
    example: 'import heapq\nh = [5, 1, 3]\nheapq.heapify(h)\nmin_val = heapq.heappop(h)',
  },
  bisect: {
    name: 'bisect',
    category: 'Collections & Data',
    description: 'Array bisection algorithm for maintaining lists in sorted order: bisect_left, insort.',
    example: 'import bisect\nidx = bisect.bisect_left([10, 20, 30], 25)',
  },
  queue: {
    name: 'queue',
    category: 'Collections & Data',
    description: 'Synchronized queue classes: Queue, LifoQueue, PriorityQueue.',
    example: 'from queue import Queue\nq = Queue()\nq.put("task")',
  },
  array: {
    name: 'array',
    category: 'Collections & Data',
    description: 'Efficient, compact arrays of basic numeric values (integers, floats).',
    example: 'from array import array\narr = array("i", [1, 2, 3, 4])',
  },
  functools: {
    name: 'functools',
    category: 'Utilities',
    description: 'Higher-order functions and operations on callables: lru_cache, reduce, partial, cmp_to_key.',
    example: 'from functools import lru_cache\n@lru_cache\ndef fib(n): return n if n < 2 else fib(n-1) + fib(n-2)',
  },
  copy: {
    name: 'copy',
    category: 'Utilities',
    description: 'Shallow and deep copying operations for nested mutable structures.',
    example: 'import copy\ncloned = copy.deepcopy(original_graph)',
  },
  dataclasses: {
    name: 'dataclasses',
    category: 'Typing & Objects',
    description: 'Automatic generation of special methods (__init__, __repr__) for classes.',
    example: '@dataclass\nclass Node:\n    val: int\n    next: Any = None',
  },
  enum: {
    name: 'enum',
    category: 'Typing & Objects',
    description: 'Support for typed enumerations: Enum, IntEnum, auto.',
    example: 'from enum import Enum, auto\nclass State(Enum):\n    IDLE = auto()',
  },
  typing: {
    name: 'typing',
    category: 'Typing & Objects',
    description: 'Type hint constructors: List, Dict, Set, Tuple, Optional, Union, Any, Callable.',
    example: 'from typing import List, Optional\ndef search(nums: List[int]) -> Optional[int]: pass',
  },
  string: {
    name: 'string',
    category: 'Text & Parsing',
    description: 'Common string constants and utilities: ascii_letters, digits, punctuation, Template.',
    example: 'import string\nallowed = string.ascii_lowercase + string.digits',
  },
  re: {
    name: 're',
    category: 'Text & Parsing',
    description: 'Regular expression matching, searching, and pattern substitution.',
    example: 'import re\nmatch = re.search(r"\\d+", "order-42")',
  },
  json: {
    name: 'json',
    category: 'Serialization',
    description: 'JSON encoder and decoder: loads, dumps for data exchange.',
    example: 'import json\ndata = json.loads(\'{"status": "ok", "count": 3}\')',
  },
  datetime: {
    name: 'datetime',
    category: 'Date & Time',
    description: 'Basic date and time types: datetime, date, time, timedelta.',
    example: 'from datetime import datetime, timedelta\ntomorrow = datetime.now() + timedelta(days=1)',
  },
  time: {
    name: 'time',
    category: 'Date & Time',
    description: 'Time access and conversions: time(), monotonic(), sleep() (sandboxed).',
    example: 'import time\nt_start = time.time()',
  },
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'shortcuts',
}) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'modules'>(initialTab)
  const [moduleSearch, setModuleSearch] = useState('')

  const filteredModules = ALLOWED_MODULES.filter((mod) => {
    const info = MODULE_DETAILS[mod]
    if (!info) return mod.includes(moduleSearch.toLowerCase())
    return (
      mod.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      info.category.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      info.description.toLowerCase().includes(moduleSearch.toLowerCase())
    )
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CodeTrace Reference & Help"
      size="lg"
      className="max-h-[85vh] flex flex-col"
    >
      <div className="flex flex-col gap-4 font-sans text-xs" data-testid="shortcuts-modal">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Tabs
            variant="pill"
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as 'shortcuts' | 'modules')}
            tabs={[
              { id: 'shortcuts', label: 'Keyboard Shortcuts' },
              { id: 'modules', label: `Supported Modules (${ALLOWED_MODULES.length})` },
            ]}
          />
        </div>

        {/* Shortcuts View */}
        {activeTab === 'shortcuts' && (
          <div className="flex flex-col gap-3">
            <p className="text-text-2 leading-relaxed">
              CodeTrace provides debugger-style navigation designed for rapid algorithm stepping and breakpoint analysis.
            </p>

            <div className="divide-y divide-border border border-border rounded-panel overflow-hidden bg-panel-body max-h-[380px] overflow-y-auto">
              {SHORTCUTS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 flex items-center justify-between gap-4 hover:bg-glass transition-colors"
                >
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-medium text-text">{item.action}</span>
                    <span className="text-[11px] text-text-3 leading-relaxed">{item.description}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 font-mono">
                    {item.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-1 rounded bg-glass-sunken border border-border-strong text-accent text-[11px] shadow-sm font-semibold"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supported Modules View */}
        {activeTab === 'modules' && (
          <div className="flex flex-col gap-3" data-testid="supported-modules-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-text-2 leading-relaxed">
                The sandbox permits exactly <strong className="text-accent">{ALLOWED_MODULES.length} curated standard library modules</strong>. All unsafe primitives (<code className="text-error font-mono">os</code>, <code className="text-error font-mono">subprocess</code>, <code className="text-error font-mono">socket</code>, <code className="text-error font-mono">pathlib</code>, <code className="text-error font-mono">sys</code> file I/O) are blocked.
              </p>

              <input
                type="text"
                data-testid="input-search-modules"
                placeholder="Filter modules..."
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                className="px-2.5 py-1 rounded-control bg-glass-sunken border border-border text-text font-mono text-xs focus:outline-none focus:border-accent w-full sm:w-44"
              />
            </div>

            <div className="divide-y divide-border border border-border rounded-panel overflow-hidden bg-panel-body max-h-[360px] overflow-y-auto">
              {filteredModules.map((mod) => {
                const info = MODULE_DETAILS[mod]
                return (
                  <div key={mod} className="p-3 flex flex-col gap-1.5 hover:bg-glass transition-colors" data-testid={`module-item-${mod}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-accent text-sm">{mod}</span>
                        {info && (
                          <span className="px-2 py-0.5 rounded-full bg-glass-sunken border border-border text-[10px] text-text-3 font-mono">
                            {info.category}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-sage font-mono">CPython 3.12</span>
                    </div>

                    {info && (
                      <p className="text-[11px] text-text-2 leading-relaxed">{info.description}</p>
                    )}

                    {info?.example && (
                      <pre className="p-2 rounded bg-bg/80 border border-border-subtle font-mono text-[10px] text-text-3 overflow-x-auto">
                        <code>{info.example}</code>
                      </pre>
                    )}
                  </div>
                )
              })}

              {filteredModules.length === 0 && (
                <div className="p-6 text-center text-text-3 font-mono">
                  No modules match &quot;{moduleSearch}&quot;
                </div>
              )}
            </div>

            {/* Sandbox Security Note */}
            <div className="p-2.5 rounded bg-glass border border-accent/20 flex items-start gap-2 text-[11px] text-text-3 font-mono">
              <span className="material-symbols-outlined text-[16px] text-accent mt-0.5">verified_user</span>
              <span>
                <strong>Defense in Depth:</strong> Execution runs inside a hardened Docker container with kernel <code className="text-accent">RLIMIT_CPU</code> &amp; <code className="text-accent">RLIMIT_AS</code> ulimits, non-root user, and disabled networking.
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <GlassButton variant="secondary" size="sm" onClick={onClose} data-testid="btn-close-shortcuts">
            Close
          </GlassButton>
        </div>
      </div>
    </Modal>
  )
}
