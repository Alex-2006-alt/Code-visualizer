import React from 'react'
import { Link } from 'react-router-dom'
import { GlassPanel, GlassButton } from '@/components/ui'

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full relative overflow-hidden select-none pb-20">
      {/* Localized Ambient Glows behind Hero (Behind, not on top of content) */}
      <div
        className="absolute top-10 -left-20 w-[560px] h-[560px] rounded-full blur-[130px] pointer-events-none -z-10"
        style={{ background: 'rgba(36, 78, 148, 0.34)' }}
      />
      <div
        className="absolute top-28 -right-20 w-[560px] h-[560px] rounded-full blur-[130px] pointer-events-none -z-10"
        style={{ background: 'rgba(34, 120, 96, 0.30)' }}
      />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-left">
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glass border border-border text-text-2 text-xs font-sans w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>Python 3.12 AST &amp; Virtual Heap Visualizer</span>
          </div>

          {/* Headline in Instrument Serif */}
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.06] text-text">
            Watch your code <br />
            <span className="italic text-accent">think in real-time.</span>
          </h1>

          {/* Subtitle in Inter */}
          <p className="font-sans text-text-2 text-base lg:text-lg max-w-xl leading-relaxed">
            Step-by-step Python execution visualizer designed for CS students and coding interview prep.
            Demystify recursion, pointers, and memory allocations with synchronized virtual heap diagrams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/workspace">
              <GlassButton
                variant="primary"
                size="lg"
                leftIcon={<span className="material-symbols-outlined text-[20px]">play_arrow</span>}
              >
                Launch Studio
              </GlassButton>
            </Link>
            <Link to="/examples">
              <GlassButton
                variant="secondary"
                size="lg"
                leftIcon={<span className="material-symbols-outlined text-accent text-[20px]">explore</span>}
              >
                Browse Algorithms
              </GlassButton>
            </Link>
          </div>

          {/* Social Proof Strip */}
          <div className="pt-6 flex flex-col gap-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm">star</span>
                ))}
              </div>
              <span className="font-sans font-semibold text-text text-xs">4.9/5</span>
              <span className="font-sans text-text-3 text-xs">from 2,300+ CS students &amp; engineers</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-text-3 font-sans text-xs">
              <span className="text-text-2">Stanford</span>
              <span className="text-border-strong">•</span>
              <span className="text-text-2">MIT</span>
              <span className="text-border-strong">•</span>
              <span className="text-text-2">UC Berkeley</span>
              <span className="text-border-strong">•</span>
              <span className="text-text-2">Waterloo</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Preview Window */}
        <div className="lg:col-span-6 relative group">
          <GlassPanel
            level={1}
            className="w-full rounded-panel border border-border shadow-panel overflow-hidden flex flex-col"
          >
            {/* Header bar */}
            <div className="h-9 px-4 bg-glass-sunken flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <div className="ml-1 text-text font-mono text-xs flex items-center gap-1.5">
                  <span>two_sum.py</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-text-3 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>AST Live Trace</span>
              </div>
            </div>

            {/* Split Editor and Visualizer Stack with Near-Opaque Panel Body */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 bg-panel-body">
              {/* Code sub-pane */}
              <div className="md:col-span-7 rounded-inner bg-glass-sunken border border-border p-3 flex flex-col font-mono text-xs leading-relaxed text-text-2 overflow-x-auto">
                <div className="flex gap-3"><span className="text-text-3 select-none">1</span><span className="text-sage">def</span> <span className="text-accent font-medium">two_sum</span>(nums, target):</div>
                <div className="flex gap-3"><span className="text-text-3 select-none">2</span><span className="pl-4 text-text">seen = &#123;&#125;</span></div>
                <div className="flex gap-3"><span className="text-text-3 select-none">3</span><span className="pl-4 text-sage">for</span> i, num <span className="text-sage">in</span> <span className="text-accent">enumerate</span>(nums):</div>
                <div className="flex gap-3"><span className="text-text-3 select-none">4</span><span className="pl-8 text-text-3"># Compute complement</span></div>
                {/* Active line without neon glow */}
                <div className="flex gap-2 bg-accent-soft border-l-2 border-accent rounded px-1 -mx-1 text-text relative my-0.5">
                  <span className="text-accent font-bold select-none">5</span>
                  <span className="pl-6 font-medium">diff = target - num</span>
                  <span className="ml-auto px-1.5 rounded bg-sage-soft text-sage font-mono text-[10px]">diff = 7</span>
                </div>
                <div className="flex gap-3"><span className="text-text-3 select-none">6</span><span className="pl-8 text-sage">if</span> diff <span className="text-sage">in</span> seen:</div>
                <div className="flex gap-3"><span className="text-text-3 select-none">7</span><span className="pl-12 text-sage">return</span> [seen[diff], i]</div>
              </div>

              {/* Right Mini Stack & Heap Preview */}
              <div className="md:col-span-5 flex flex-col gap-2.5">
                <div className="p-2.5 rounded-inner bg-glass-sunken border border-border flex flex-col gap-1.5 shadow-panel">
                  <span className="font-sans text-[11px] font-medium text-text-3 uppercase tracking-[0.08em]">Stack: two_sum()</span>
                  <div className="flex justify-between font-mono text-[11px]"><span className="text-text-3">num</span><span className="text-accent font-medium">7</span></div>
                  <div className="flex justify-between font-mono text-[11px]"><span className="text-text-3">diff</span><span className="text-sage font-medium">2</span></div>
                </div>

                <div className="p-2.5 rounded-inner bg-glass-sunken border border-border flex flex-col gap-1.5 shadow-panel">
                  <span className="font-sans text-[11px] font-medium text-text-3 uppercase tracking-[0.08em]">Heap: seen (dict)</span>
                  <div className="p-1 rounded-control bg-glass border border-border font-mono text-[11px] text-center text-text">
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
          <span className="font-sans text-xs uppercase tracking-[0.08em] text-text-3">
            Architected for CS Mastery
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-text">
            Everything your debugger never showed you.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassPanel level={1} className="p-6 flex flex-col gap-3 rounded-panel border border-border shadow-panel">
            <div className="w-9 h-9 rounded-control bg-glass border border-border text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </div>
            <h3 className="font-serif text-xl text-text font-normal">Recursive Call Stacks</h3>
            <p className="font-sans text-sm text-text-2 leading-relaxed">
              Visualize push and pop stack physics with depth telemetry. See parameters bound, return values bubbling up, and base case terminations.
            </p>
          </GlassPanel>

          <GlassPanel level={1} className="p-6 flex flex-col gap-3 rounded-panel border border-border shadow-panel">
            <div className="w-9 h-9 rounded-control bg-glass border border-border text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">account_tree</span>
            </div>
            <h3 className="font-serif text-xl text-text font-normal">Virtual Heap &amp; Pointers</h3>
            <p className="font-sans text-sm text-text-2 leading-relaxed">
              Demystify reference types, array slicing, object mutation, and hash collision tables with animated SVG pointer connections.
            </p>
          </GlassPanel>

          <GlassPanel level={1} className="p-6 flex flex-col gap-3 rounded-panel border border-border shadow-panel">
            <div className="w-9 h-9 rounded-control bg-glass border border-border text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <h3 className="font-serif text-xl text-text font-normal">Active Recall &amp; Compare</h3>
            <p className="font-sans text-sm text-text-2 leading-relaxed">
              Predict mode pauses execution before branch dispatch to test mental models. Compare mode synchronizes brute force vs optimal solutions side by side.
            </p>
          </GlassPanel>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full pt-12">
        <GlassPanel level={1} className="p-8 sm:p-12 text-center flex flex-col items-center gap-6 rounded-panel border border-border-strong shadow-float bg-glass-raised">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-text">
            Ready to master algorithmic execution?
          </h2>
          <p className="font-sans text-sm text-text-2 max-w-xl leading-relaxed">
            Join thousands of students and engineers tracing Python bytecode with zero configuration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/workspace">
              <GlassButton variant="primary" size="lg">
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
