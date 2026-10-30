import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { GlassPanel, GlassButton, Chip } from '@/components/ui'

interface AlgorithmExample {
  id: string
  title: string
  number?: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  timeComplexity: string
  spaceComplexity: string
  description: string
  snippet: string
}

const ALGORITHMS: AlgorithmExample[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    number: '#1',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Find two indices in an array whose values sum to a specific target using a hash map lookup.',
    snippet: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen: return [seen[diff], i]\n        seen[num] = i',
  },
  {
    id: 'factorial-recursion',
    title: 'Factorial Recursion',
    difficulty: 'Easy',
    category: 'Recursion',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Classic call stack recursion demo illustrating stack frame allocations and return unwinding.',
    snippet: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)',
  },
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    difficulty: 'Easy',
    category: 'Sorting',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Step through pairwise element swaps and array mutations with amber highlight notifications.',
    snippet: 'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]',
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    number: '#704',
    difficulty: 'Easy',
    category: 'Binary Search',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Halve the search space at each step by comparing target against median pointer index.',
    snippet: 'def search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1',
  },
  {
    id: 'invert-tree',
    title: 'Invert Binary Tree',
    number: '#226',
    difficulty: 'Easy',
    category: 'Trees & Graphs',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Recursive tree traversal swapping left and right pointer nodes on the virtual heap.',
    snippet: 'def invert_tree(root):\n    if not root: return None\n    root.left, root.right = invert_tree(root.right), invert_tree(root.left)\n    return root',
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs (DP)',
    number: '#70',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Fibonacci recurrence relations demonstrating memoization array and rolling state variables.',
    snippet: 'def climb_stairs(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b',
  },
]

export const ExamplesPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')

  const categories = ['All', 'Arrays & Hashing', 'Recursion', 'Sorting', 'Binary Search', 'Trees & Graphs', 'Dynamic Programming']
  const difficulties = ['All', 'Easy', 'Medium', 'Hard']

  const filteredAlgorithms = useMemo(() => {
    return ALGORITHMS.filter((algo) => {
      const matchesSearch =
        algo.title.toLowerCase().includes(search.toLowerCase()) ||
        algo.description.toLowerCase().includes(search.toLowerCase()) ||
        (algo.number && algo.number.includes(search))
      const matchesCat = selectedCategory === 'All' || algo.category === selectedCategory
      const matchesDiff = selectedDifficulty === 'All' || algo.difficulty === selectedDifficulty
      return matchesSearch && matchesCat && matchesDiff
    })
  }, [search, selectedCategory, selectedDifficulty])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 w-full">
      {/* Header */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-text-3 text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-glass-sunken text-accent border border-border font-mono text-[11px]">
            CURATED ALGORITHM LIBRARY
          </span>
          <span>•</span>
          <span className="text-text-3 font-mono text-xs">100+ Visualized Archetypes</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <h1 className="font-serif text-3xl sm:text-4xl text-text font-normal tracking-tight">
              Explore Classic Algorithms
            </h1>
            <p className="font-sans text-text-2 text-sm sm:text-base leading-relaxed">
              Step-by-step traces with call stack visualization, virtual heap mutations, and Big-O complexity comparison.
            </p>
          </div>
          <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-glass border border-border shadow-panel shrink-0">
            <div className="flex flex-col">
              <span className="font-sans text-[10px] text-text-3 uppercase tracking-wider">Total Traces</span>
              <span className="font-mono text-accent font-semibold text-sm">1,248,930</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col">
              <span className="font-sans text-[10px] text-text-3 uppercase tracking-wider">Accuracy</span>
              <span className="font-mono text-sage font-semibold text-sm">94.2%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Matrix */}
      <GlassPanel level={2} className="p-4 flex flex-col gap-3.5">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search algorithms by name, keyword, or number (e.g. Two Sum, DFS, #1)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-glass-sunken border border-border text-text placeholder:text-text-3 text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-sans text-[11px] text-text-3 uppercase tracking-wider">Tier:</span>
            {difficulties.map((diff) => (
              <Chip
                key={diff}
                label={diff}
                active={selectedDifficulty === diff}
                onClick={() => setSelectedDifficulty(diff)}
              />
            ))}
          </div>
        </div>
      </GlassPanel>

      {/* Grid of Algorithms */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlgorithms.map((algo) => (
          <GlassPanel
            key={algo.id}
            level={1}
            className="p-5 flex flex-col justify-between gap-4 transition-all duration-200"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-glass-sunken text-accent font-mono text-xs font-medium border border-border">
                    {algo.difficulty}
                  </span>
                  <span className="font-sans text-xs text-text-3">{algo.category}</span>
                </div>
                <span className="font-mono text-[11px] text-sage">{algo.timeComplexity}</span>
              </div>

              <div>
                <h3 className="font-serif text-xl text-text font-normal flex items-center gap-1.5">
                  <span>{algo.title}</span>
                  {algo.number && <span className="text-text-3 text-sm font-mono font-normal">{algo.number}</span>}
                </h3>
                <p className="font-sans text-text-2 text-xs mt-1 leading-relaxed line-clamp-2">
                  {algo.description}
                </p>
              </div>

              {/* Code snippet snapshot */}
              <div className="p-3 rounded-lg bg-panel-body border border-border font-mono text-[11px] text-text-2 leading-relaxed overflow-x-auto">
                <pre>{algo.snippet}</pre>
              </div>
            </div>

            <Link to={`/workspace?preset=${algo.id}`} className="w-full">
              <GlassButton
                variant="secondary"
                size="sm"
                className="w-full justify-between"
                rightIcon={<span className="material-symbols-outlined text-[16px]">arrow_forward</span>}
              >
                Trace in Visualizer
              </GlassButton>
            </Link>
          </GlassPanel>
        ))}
      </section>
    </div>
  )
}
