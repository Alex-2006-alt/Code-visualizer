import React from 'react'
import { Link } from 'react-router-dom'
import { GlassPanel, GlassButton } from '@/components/ui'

export const HeroSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
      {/* Left Column: Copy & Actions */}
      <div className="lg:col-span-6 flex flex-col gap-6 text-left">
        {/* Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glass-sunken border border-border text-text-2 text-xs font-sans w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span>Python 3.12 Step-by-Step Execution Visualizer</span>
        </div>

        {/* Headline in Instrument Serif */}
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.05] text-text">
          Watch your Python code <br />
          <span className="italic text-accent">think in real time.</span>
        </h1>

        {/* Subtitle in Inter (< 40 words) */}
        <p className="font-sans text-text-2 text-base sm:text-lg max-w-xl leading-relaxed">
          Step through Python execution line by line. Inspect local stack frames,
          watch container mutations in a virtual heap, and measure algorithmic complexity without print statements.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3.5 pt-2">
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

        {/* Quick Highlights Strip */}
        <div className="pt-6 border-t border-border grid grid-cols-3 gap-4 font-mono text-xs text-text-3">
          <div>
            <span className="text-text font-semibold block text-sm">2,000</span>
            <span>Step replay cap</span>
          </div>
          <div>
            <span className="text-accent font-semibold block text-sm">CPython 3.12</span>
            <span>Isolated sandbox</span>
          </div>
          <div>
            <span className="text-sage font-semibold block text-sm">Big-O</span>
            <span>Empirical fit</span>
          </div>
        </div>
      </div>

      {/* Right Column: Authentic Glass Panel UI Preview */}
      <div className="lg:col-span-6 relative">
        <GlassPanel
          level={1}
          className="w-full rounded-panel border border-border shadow-panel overflow-hidden flex flex-col"
        >
          {/* Header Bar */}
          <div className="h-9 px-4 bg-glass-sunken flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
              <span className="text-text font-mono text-xs">script.py</span>
            </div>
            <div className="flex items-center gap-2 text-text-3 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>Step 5 / 13 • Ln 5</span>
            </div>
          </div>

          {/* Split Code and Diagnostics Body */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3.5 bg-panel-body">
            {/* Left: Code Snippet */}
            <div className="md:col-span-7 rounded-inner bg-glass-sunken border border-border p-3 flex flex-col font-mono text-xs leading-relaxed text-text-2 overflow-x-auto">
              <div className="flex gap-2.5"><span className="text-text-3 select-none w-4 text-right">1</span><span className="text-sage">def</span> <span className="text-accent font-medium">two_sum</span>(nums, target):</div>
              <div className="flex gap-2.5"><span className="text-text-3 select-none w-4 text-right">2</span><span className="pl-3 text-text">seen = &#123;&#125;</span></div>
              <div className="flex gap-2.5"><span className="text-text-3 select-none w-4 text-right">3</span><span className="pl-3 text-sage">for</span> i, num <span className="text-sage">in</span> <span className="text-accent">enumerate</span>(nums):</div>
              <div className="flex gap-2.5"><span className="text-text-3 select-none w-4 text-right">4</span><span className="pl-6 text-text-3"># complement check</span></div>
              {/* Active Line with Hairline Accent */}
              <div className="flex gap-2 bg-accent-soft border-l-2 border-accent rounded px-1 -mx-1 text-text my-0.5 items-center">
                <span className="text-accent font-bold select-none w-4 text-right">5</span>
                <span className="pl-4 font-medium text-text">diff = target - num</span>
              </div>
              <div className="flex gap-2.5"><span className="text-text-3 select-none w-4 text-right">6</span><span className="pl-6 text-sage">if</span> diff <span className="text-sage">in</span> seen:</div>
              <div className="flex gap-2.5"><span className="text-text-3 select-none w-4 text-right">7</span><span className="pl-9 text-sage">return</span> [seen[diff], i]</div>
              <div className="flex gap-2.5"><span className="text-text-3 select-none w-4 text-right">8</span><span className="pl-6 text-text">seen[num] = i</span></div>
            </div>

            {/* Right: Stack Frame & Virtual Heap */}
            <div className="md:col-span-5 flex flex-col gap-2.5">
              {/* Call Stack Card */}
              <div className="p-2.5 rounded-inner bg-glass-sunken border border-border flex flex-col gap-1.5 shadow-panel">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[10px] font-medium text-text-3 uppercase tracking-wider">
                    Stack: two_sum()
                  </span>
                  <span className="text-[10px] font-mono text-accent">Active Frame</span>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between items-center"><span className="text-text-3">i</span><span className="text-text">1</span></div>
                  <div className="flex justify-between items-center"><span className="text-text-3">num</span><span className="text-accent font-medium">7</span></div>
                  <div className="flex justify-between items-center"><span className="text-text-3">diff</span><span className="text-sage font-medium">2</span></div>
                </div>
              </div>

              {/* Virtual Heap Card with Friendly Reference Tag */}
              <div className="p-2.5 rounded-inner bg-glass-sunken border border-border flex flex-col gap-1.5 shadow-panel">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-accent/20 text-accent font-mono text-[10px] font-bold">@1</span>
                    <span className="font-sans text-[10px] font-medium text-text-3 uppercase tracking-wider">
                      dict (seen)
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-text-3">heap object</span>
                </div>
                <div className="p-1.5 rounded-control bg-panel-body border border-border font-mono text-[11px] text-text">
                  <div className="flex justify-between py-0.5 border-b border-border/50 text-[10px] text-text-3">
                    <span>Key</span>
                    <span>Value</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-accent">2</span>
                    <span className="text-sage">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </section>
  )
}
