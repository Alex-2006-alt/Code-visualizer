import React from 'react'
import { Link } from 'react-router-dom'
import { GlassPanel, GlassButton } from '@/components/ui'

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full relative overflow-hidden select-none pb-20">
      {/* Ambient localized radial glow behind hero */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[520px] bg-gradient-to-tr from-primary/15 via-secondary/15 to-tertiary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-left">
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-surface-container-high/90 text-on-surface w-fit shadow-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            <span className="font-code-sm text-secondary tracking-wide">
              ✨ New: Python 3.12 AST &amp; Heap Graph Visualizer
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-headline-xl text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-white">
            Watch your code <br />
            <span className="bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-transparent">
              think in real-time.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body-md text-on-surface-variant text-base lg:text-lg max-w-xl leading-relaxed">
            Step-by-step Python execution visualizer designed for CS students and coding interview prep.
            Demystify recursion, pointers, and memory allocations with synchronized virtual heap diagrams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/workspace">
              <GlassButton
                variant="primary"
                size="lg"
                glow
                leftIcon={<span className="material-symbols-outlined text-[20px]">bolt</span>}
              >
                Launch Studio
              </GlassButton>
            </Link>
            <Link to="/examples">
              <GlassButton
                variant="secondary"
                size="lg"
                leftIcon={<span className="material-symbols-outlined text-secondary text-[20px]">play_circle</span>}
              >
                Browse Algorithms
              </GlassButton>
            </Link>
          </div>

          {/* Social Proof Strip */}
          <div className="pt-6 flex flex-col gap-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm">star</span>
                ))}
              </div>
              <span className="font-body-sm font-semibold text-white">4.9/5</span>
              <span className="font-body-sm text-outline">from 2,300+ engineering reviews</span>
            </div>
            <p className="font-code-sm text-outline uppercase tracking-wider text-[10px]">
              Trusted by 45,000+ students &amp; engineers at
            </p>
            <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-headline-sm text-sm opacity-80">
              <span className="font-semibold text-white">Stanford</span>
              <span className="text-outline">•</span>
              <span className="font-semibold text-white">MIT</span>
              <span className="text-outline">•</span>
              <span className="font-semibold text-white">UC Berkeley</span>
              <span className="text-outline">•</span>
              <span className="font-semibold text-white">Waterloo</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Perspective Glass IDE Preview */}
        <div className="lg:col-span-6 relative perspective-[1000px] group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/20 blur-3xl -z-10 group-hover:blur-[80px] transition-all duration-700" />
          <GlassPanel
            level={3}
            className="w-full rounded-2xl transform lg:[transform:rotateY(-6deg)_rotateX(4deg)] group-hover:transform-none transition-transform duration-700 overflow-hidden flex flex-col"
          >
            {/* Header bar */}
            <div className="h-10 px-4 bg-surface-container-lowest/90 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <div className="ml-3 px-3 py-0.5 rounded-t-lg bg-surface-container-high/80 text-white font-code-sm text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-xs">terminal</span>
                  <span>two_sum.py</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-outline font-code-sm text-[11px]">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>AST Live Trace</span>
              </div>
            </div>

            {/* Split Editor and Visualizer Stack */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 bg-surface-container/40">
              {/* Code sub-pane */}
              <div className="md:col-span-7 rounded-xl bg-surface-container-lowest/90 p-3 flex flex-col font-code-sm text-xs leading-relaxed text-on-surface-variant overflow-x-auto shadow-inner">
                <div className="flex gap-3"><span className="text-outline-variant select-none">1</span><span className="text-tertiary">def</span> <span className="text-secondary font-medium">two_sum</span>(nums, target):</div>
                <div className="flex gap-3"><span className="text-outline-variant select-none">2</span><span className="pl-4 text-on-surface">seen = &#123;&#125;</span></div>
                <div className="flex gap-3"><span className="text-outline-variant select-none">3</span><span className="pl-4 text-tertiary">for</span> i, num <span className="text-tertiary">in</span> <span className="text-secondary">enumerate</span>(nums):</div>
                <div className="flex gap-3"><span className="text-outline-variant select-none">4</span><span className="pl-8 text-outline"># Compute complement</span></div>
                {/* Active line with glow */}
                <div className="flex gap-2 bg-secondary/15 rounded px-1 -mx-1 text-white shadow-[0_0_16px_rgba(93,230,255,0.25)] relative my-0.5 border-l-2 border-secondary">
                  <span className="text-secondary font-bold select-none">5</span>
                  <span className="pl-6 font-medium">diff = target - num</span>
                  <span className="ml-auto px-1.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[10px] animate-pulse">diff = 7</span>
                </div>
                <div className="flex gap-3"><span className="text-outline-variant select-none">6</span><span className="pl-8 text-tertiary">if</span> diff <span className="text-tertiary">in</span> seen:</div>
                <div className="flex gap-3"><span className="text-outline-variant select-none">7</span><span className="pl-12 text-tertiary">return</span> [seen[diff], i]</div>
              </div>

              {/* Right Mini Stack & Heap Preview */}
              <div className="md:col-span-5 flex flex-col gap-2.5">
                <div className="p-2.5 rounded-xl bg-surface-container-high/70 border border-white/5 flex flex-col gap-1.5 shadow-sm">
                  <span className="font-label-caps text-[10px] text-primary uppercase">Stack Frame: two_sum()</span>
                  <div className="flex justify-between font-code-sm text-[11px]"><span className="text-outline">num</span><span className="text-secondary font-bold">7</span></div>
                  <div className="flex justify-between font-code-sm text-[11px]"><span className="text-outline">diff</span><span className="text-amber-300 font-bold">2</span></div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-high/70 border border-white/5 flex flex-col gap-1.5 shadow-sm">
                  <span className="font-label-caps text-[10px] text-secondary uppercase">Heap Allocation: seen (dict)</span>
                  <div className="p-1 rounded bg-surface-container-lowest font-code-sm text-[11px] text-center text-primary">
                    &#123; 2: 0 &#125;
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* THREE PILLAR FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
        <div className="text-center flex flex-col items-center gap-2">
          <span className="font-code-sm text-secondary uppercase tracking-widest text-xs">
            Architected for CS Mastery
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-white">
            Everything your debugger never showed you.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassPanel level={1} className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">layers</span>
            </div>
            <h3 className="font-headline-sm text-lg text-white font-semibold">Recursive Call Stacks</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              Visualize push and pop stack physics with depth telemetry. See parameters bound, return values bubbling up, and base case terminations.
            </p>
          </GlassPanel>

          <GlassPanel level={1} className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">account_tree</span>
            </div>
            <h3 className="font-headline-sm text-lg text-white font-semibold">Virtual Heap &amp; Pointers</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              Demystify reference types, array slicing, object mutation, and hash collision tables with animated SVG pointer connections.
            </p>
          </GlassPanel>

          <GlassPanel level={1} className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <h3 className="font-headline-sm text-lg text-white font-semibold">Active Recall &amp; Compare</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              Predict mode pauses execution before branch dispatch to test mental models. Compare mode synchronizes brute force vs optimal solutions side by side.
            </p>
          </GlassPanel>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full pt-12">
        <GlassPanel level={3} className="p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-glow-primary">
          <h2 className="font-headline-xl text-3xl sm:text-4xl font-bold text-white">
            Ready to master algorithmic execution?
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-xl">
            Join thousands of students and engineers tracing Python bytecode with zero configuration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/workspace">
              <GlassButton variant="primary" size="lg" glow>
                Launch CodeTrace Free
              </GlassButton>
            </Link>
            <Link to="/examples">
              <GlassButton variant="secondary" size="lg">
                View 100+ Examples
              </GlassButton>
            </Link>
          </div>
        </GlassPanel>
      </section>
    </div>
  )
}
