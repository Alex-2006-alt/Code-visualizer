import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassPanel } from '@/components/ui'

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: 'How does CodeTrace trace Python execution?',
    answer:
      'CodeTrace executes your code in an isolated CPython 3.12 sandbox using sys.settrace. At every line transition, function call, and return event, the engine snapshots local scope bindings, active stack frames, and virtual heap container topologies into a structured JSON event stream.',
  },
  {
    question: 'Can I use external packages like NumPy or Pandas?',
    answer:
      'Not currently. To maintain instant sub-second execution and prevent unbounded container sizes, CodeTrace runs pure Python 3.12 with standard computational libraries (math, random, collections, itertools, heapq, bisect, functools, string, re, and typing).',
  },
  {
    question: 'How is algorithmic complexity estimated?',
    answer:
      'CodeTrace is an empirical estimator, not a formal mathematical theorem prover. It executes your target function across growing input sizes (N = 5, 10, 20, 40, 80), counts real operations, and fits normalized curves across 7 standard Big-O models alongside AST structure heuristics.',
  },
  {
    question: 'Why did my execution stop at 2,000 steps?',
    answer:
      'To prevent runaway infinite loops from crashing browser tabs or freezing system resources, execution traces are capped at 2,000 recorded steps. Scripts that hit this limit display an informative "Step Limit Reached" banner.',
  },
  {
    question: 'Is my code saved or shared with third parties?',
    answer:
      'Your code is only stored in our database when you explicitly click the "Share" button to create a reproducible permalink snippet. Regular execution traces run ephemerally in transient memory and are discarded after playback.',
  },
  {
    question: 'Is CodeTrace free to use?',
    answer:
      'Yes, CodeTrace is completely free and open-source under the MIT license. You can clone the repository, run the stack locally, or deploy it on your own infrastructure with Docker Compose.',
  },
  {
    question: 'What Python version runs in the sandbox?',
    answer:
      'CodeTrace runs standard CPython 3.12. All standard language syntax—including structural pattern matching, type annotations, list comprehensions, and classes—is fully supported.',
  },
]

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-10">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2.5 max-w-2xl mx-auto">
        <span className="font-sans text-xs uppercase tracking-[0.08em] text-accent font-medium">
          Common Questions
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight">
          Frequently asked questions.
        </h2>
        <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
          Clear, honest details about our execution engine, security model, and limits.
        </p>
      </div>

      {/* Accordion Stack */}
      <div className="space-y-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx
          return (
            <GlassPanel
              key={idx}
              level={1}
              className="rounded-panel border border-border shadow-panel overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:bg-glass-raised transition-colors"
              >
                <span className="font-serif text-xl sm:text-2xl text-text font-normal">
                  {faq.question}
                </span>
                <span
                  className={`material-symbols-outlined text-text-3 text-xl shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-accent' : ''
                  }`}
                >
                  keyboard_arrow_down
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-text-2 font-sans leading-relaxed border-t border-border/40 pt-3">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassPanel>
          )
        })}
      </div>
    </section>
  )
}
