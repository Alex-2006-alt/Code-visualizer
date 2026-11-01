import React from 'react'
import { GlassPanel } from '@/components/ui'

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Paste or Write Python',
      icon: 'code',
      desc: 'Enter standard Python 3.12 code or start from one of our curated algorithm presets.',
      detail: 'Monaco editor with syntax highlighting, auto-indent, and error markers.',
    },
    {
      step: '02',
      title: 'Run in Sandbox',
      icon: 'terminal',
      desc: 'Your code executes inside an isolated Python sandbox with strict CPU, memory, and timeout bounds.',
      detail: 'Hard 5-second ceiling, 128 MB RAM, and 2,000 recorded execution steps.',
    },
    {
      step: '03',
      title: 'Replay Every Frame',
      icon: 'history',
      desc: 'Step forward, backward, or scrub the timeline to inspect variable states at each exact line.',
      detail: 'Watch variables mutate and stack frames unwind with synchronized speed controls.',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-10">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2.5 max-w-2xl mx-auto">
        <span className="font-sans text-xs uppercase tracking-[0.08em] text-accent font-medium">
          Execution Pipeline
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight">
          Three steps from script to step-by-step trace.
        </h2>
        <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
          No complex IDE configurations or debugger plugins required.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((item) => (
          <GlassPanel
            key={item.step}
            level={1}
            className="p-6 sm:p-7 flex flex-col justify-between gap-5 rounded-panel border border-border shadow-panel"
          >
            <div className="flex flex-col gap-4">
              {/* Header row: Icon & Step Number */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-control bg-glass-sunken border border-border text-accent flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                </div>
                <span className="font-mono text-2xl font-bold text-text-3 opacity-60">
                  {item.step}
                </span>
              </div>

              {/* Title & Body */}
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-2xl text-text font-normal">
                  {item.title}
                </h3>
                <p className="font-sans text-sm text-text-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>

            {/* Micro telemetry footer */}
            <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-text-3 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-sage" />
              <span>{item.detail}</span>
            </div>
          </GlassPanel>
        ))}
      </div>
    </section>
  )
}
