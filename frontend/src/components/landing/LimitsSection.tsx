import React from 'react'
import { GlassPanel } from '@/components/ui'

export const LimitsSection: React.FC = () => {
  const supported = [
    'Python 3.12 syntax (functions, loops, classes, recursion)',
    'Standard math & collections (itertools, heapq, bisect, re, typing)',
    'Execution traces up to 2,000 recorded steps',
    'Standard input (stdin) & stdout capture up to 64 KB',
    'Empirical Big-O estimation across 7 complexity models',
  ]

  const restricted = [
    'External packages (numpy, pandas, scipy not installed)',
    'Network sockets, HTTP requests, or external APIs',
    'Filesystem read/write operations (open(), pathlib)',
    'Multiprocessing, multithreading, or subprocess execution',
    'Desktop GUI or plotting windows (matplotlib, pygame, tkinter)',
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-10">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2.5 max-w-2xl mx-auto">
        <span className="font-sans text-xs uppercase tracking-[0.08em] text-accent font-medium">
          Sandbox Boundaries
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight">
          What it supports — and what it doesn&apos;t.
        </h2>
        <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
          We believe in transparency about our sandbox capabilities and architectural boundaries.
        </p>
      </div>

      {/* Two-Column Comparison Panel */}
      <GlassPanel level={1} className="p-6 sm:p-8 rounded-panel border border-border shadow-panel">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Supported */}
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2 pb-2">
              <span className="material-symbols-outlined text-sage text-xl">check_circle</span>
              <h3 className="font-serif text-2xl text-text font-normal">
                Supported Capabilities
              </h3>
            </div>
            <ul className="space-y-3 font-sans text-sm text-text-2">
              {supported.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-sage text-base mt-0.5 shrink-0">check</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Restricted */}
          <div className="flex flex-col gap-4 text-left pt-6 md:pt-0 md:pl-8">
            <div className="flex items-center gap-2 pb-2">
              <span className="material-symbols-outlined text-text-3 text-xl">block</span>
              <h3 className="font-serif text-2xl text-text font-normal">
                Sandbox Restrictions
              </h3>
            </div>
            <ul className="space-y-3 font-sans text-sm text-text-2">
              {restricted.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-text-3 text-base mt-0.5 shrink-0">close</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassPanel>
    </section>
  )
}
