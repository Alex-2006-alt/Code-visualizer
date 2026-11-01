import React from 'react'
import { GlassPanel } from '@/components/ui'

export const AudienceSection: React.FC = () => {
  const audiences = [
    {
      icon: 'school',
      title: 'Computer Science Students',
      description:
        'Grasp pointer references, recursion stack frames, and object mutation without drawing memory diagrams by hand.',
      highlight: 'Deep mental models',
    },
    {
      icon: 'psychology',
      title: 'Interview Preparation',
      description:
        'Verify edge cases, test your mental execution in Predict mode, and compare brute-force vs optimal solution efficiency.',
      highlight: 'Active recall testing',
    },
    {
      icon: 'cast_for_education',
      title: 'Educators & Mentors',
      description:
        'Share interactive code traces that walk students through algorithms step by step with reproducible permalinks.',
      highlight: 'One-click share links',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-10">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2.5 max-w-2xl mx-auto">
        <span className="font-sans text-xs uppercase tracking-[0.08em] text-accent font-medium">
          Target Audience
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight">
          Designed for learners and engineers.
        </h2>
        <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
          Built for anyone who wants to understand exactly how their code runs.
        </p>
      </div>

      {/* 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {audiences.map((aud) => (
          <GlassPanel
            key={aud.title}
            level={1}
            className="p-6 sm:p-7 rounded-panel border border-border shadow-panel flex flex-col justify-between gap-5"
          >
            <div className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-control bg-glass-sunken border border-border text-accent flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">{aud.icon}</span>
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <h3 className="font-serif text-2xl text-text font-normal">
                  {aud.title}
                </h3>
                <p className="font-sans text-sm text-text-2 leading-relaxed">
                  {aud.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-text-3 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>{aud.highlight}</span>
            </div>
          </GlassPanel>
        ))}
      </div>
    </section>
  )
}
