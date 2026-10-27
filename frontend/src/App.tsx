import React from 'react'
import { BackgroundCanvas } from '@/components/layout/BackgroundCanvas'

export const App: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between text-on-surface">
      <BackgroundCanvas />

      {/* Atmospheric Header Bar Preview */}
      <header className="relative z-10 w-full h-16 border-b border-white/10 bg-surface/70 backdrop-blur-xl px-space-lg flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-white/10 flex items-center justify-center shadow-[0_0_12px_rgba(202,190,255,0.25)]">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              terminal
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm font-semibold tracking-tight text-white leading-none">
              CodeTrace
            </span>
            <span className="font-label-caps text-secondary uppercase tracking-wider text-[10px] mt-0.5">
              Phase 1 Tokens & Foundations Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-code-sm border border-secondary/30">
            Python 3.12 VM
          </span>
        </div>
      </header>

      {/* Main Glass Token Demonstration Container */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-space-md py-space-xl flex flex-col gap-space-lg">
        <section className="glass-panel-1 rounded-2xl p-space-lg flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h1 className="font-headline-xl text-white">Design Tokens & Glass Foundations</h1>
            <span className="font-code-sm text-secondary bg-surface-container px-3 py-1 rounded-full border border-white/10">
              DS-KERNEL v3.8
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            Obsidian Trace Runtime design tokens loaded. Translucent fills, 1px specular rim
            highlights, and physics-driven ambient glows.
          </p>

          {/* Color & Glow Swatches */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-2">
            <div className="p-space-sm rounded-xl bg-surface-container-low border border-white/10 flex flex-col gap-1">
              <span className="w-4 h-4 rounded-full bg-primary shadow-glow-primary mb-1"></span>
              <span className="font-label-caps uppercase text-on-surface-variant">Primary Violet</span>
              <span className="font-code-sm text-primary font-mono">#CABEFF</span>
            </div>
            <div className="p-space-sm rounded-xl bg-surface-container-low border border-white/10 flex flex-col gap-1">
              <span className="w-4 h-4 rounded-full bg-secondary shadow-glow-secondary mb-1"></span>
              <span className="font-label-caps uppercase text-on-surface-variant">Pointer Cyan</span>
              <span className="font-code-sm text-secondary font-mono">#5DE6FF</span>
            </div>
            <div className="p-space-sm rounded-xl bg-surface-container-low border border-white/10 flex flex-col gap-1">
              <span className="w-4 h-4 rounded-full bg-tertiary shadow-[0_0_12px_rgba(248,172,255,0.4)] mb-1"></span>
              <span className="font-label-caps uppercase text-on-surface-variant">Mutation Amber</span>
              <span className="font-code-sm text-tertiary font-mono">#FBBF24</span>
            </div>
            <div className="p-space-sm rounded-xl bg-surface-container-low border border-white/10 flex flex-col gap-1">
              <span className="w-4 h-4 rounded-full bg-error shadow-glow-error mb-1"></span>
              <span className="font-label-caps uppercase text-on-surface-variant">Trap Crimson</span>
              <span className="font-code-sm text-error font-mono">#FFB4AB</span>
            </div>
          </div>
        </section>

        {/* 3 Glass Levels Showcase */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="glass-panel-1 rounded-xl p-space-md flex flex-col justify-between min-h-[140px]">
            <span className="font-label-caps uppercase text-secondary">Level 1: Standard Glass</span>
            <span className="font-code-sm text-on-surface-variant">6% α / 24px Blur / Specular Rim</span>
            <span className="font-body-sm text-on-surface">Panels, cards, diagram substrates</span>
          </div>

          <div className="glass-panel-2 rounded-xl p-space-md flex flex-col justify-between min-h-[140px]">
            <span className="font-label-caps uppercase text-primary">Level 2: Darkened Glass</span>
            <span className="font-code-sm text-on-surface-variant">65% α / 20px Blur / Anti-Glare</span>
            <span className="font-body-sm text-on-surface">High-density code editor backing</span>
          </div>

          <div className="glass-panel-3 rounded-xl p-space-md flex flex-col justify-between min-h-[140px]">
            <span className="font-label-caps uppercase text-secondary">Level 3: Elevated HUD</span>
            <span className="font-code-sm text-on-surface-variant">90% α / 32px Blur / Deep Shadow</span>
            <span className="font-body-sm text-on-surface">Floating timeline dock, toasts, modals</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 py-space-sm px-space-lg text-center font-code-sm text-outline">
        CodeTrace Interactive Architecture • Phase 1 Token Scaffold Complete
      </footer>
    </div>
  )
}

export default App
