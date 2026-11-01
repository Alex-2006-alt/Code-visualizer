import React from 'react'
import { Link } from 'react-router-dom'
import { GlassPanel, GlassButton } from '@/components/ui'

export const ClosingCtaSection: React.FC = () => {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full py-16">
      <GlassPanel
        level={1}
        className="p-8 sm:p-14 text-center flex flex-col items-center gap-6 rounded-panel border border-border-strong shadow-float bg-glass-raised"
      >
        <span className="font-sans text-xs uppercase tracking-[0.08em] text-accent font-medium">
          Get Started Now
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight max-w-2xl">
          Paste your own Python and watch it run, step by step.
        </h2>

        <p className="font-sans text-sm sm:text-base text-text-2 max-w-xl leading-relaxed">
          Step through execution, inspect stack frames, and demystify your algorithms today.
          Completely free and open-source under the MIT license.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link to="/workspace">
            <GlassButton
              variant="primary"
              size="lg"
              leftIcon={<span className="material-symbols-outlined text-[20px]">play_arrow</span>}
            >
              Open the Studio
            </GlassButton>
          </Link>
          <Link to="/examples">
            <GlassButton
              variant="secondary"
              size="lg"
              leftIcon={<span className="material-symbols-outlined text-accent text-[20px]">explore</span>}
            >
              Browse Algorithm Presets
            </GlassButton>
          </Link>
        </div>
      </GlassPanel>
    </section>
  )
}
