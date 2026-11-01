import React from 'react'
import { Link } from 'react-router-dom'
import { GlassPanel } from '@/components/ui'

export const FeatureDeepDives: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-24 sm:gap-32">
      {/* ─────────────────────────────────────────────────────────────
          1. STEP-BY-STEP REPLAY
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Copy */}
        <div className="lg:col-span-6 flex flex-col gap-5 text-left order-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-glass-sunken border border-border text-accent text-xs font-mono w-fit">
            <span>FEATURE 01</span>
            <span>•</span>
            <span>TEMPORAL REPLAY</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight leading-tight">
            Scrub forward and backward through time.
          </h3>

          <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
            Debug without restarting your script. Use the timeline slider or keyboard shortcuts
            to travel between execution steps and observe how line transitions mutate variables.
          </p>

          <ul className="space-y-2 text-sm text-text-2 font-sans">
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>Smooth scrubbing from step 0 to the final return.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>Speed controls from 0.5x slow motion to 4x fast replay.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>Keyboard shortcuts: Space to play/pause, arrows to step.</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              to="/workspace?preset=bubble-sort"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              <span>Try it with Bubble Sort</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="lg:col-span-6 order-2">
          <GlassPanel level={1} className="p-4 sm:p-5 rounded-panel border border-border shadow-panel flex flex-col gap-3">
            {/* Window titlebar */}
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-mono text-text-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <span className="text-text">Timeline &amp; Replay Controller</span>
              </div>
              <span className="text-sage">PLAYING • 1.0x</span>
            </div>

            {/* Simulated Timeline Bar */}
            <div className="p-4 rounded-inner bg-panel-body border border-border flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-control bg-accent text-on-accent flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[18px]">pause</span>
                  </div>
                  <div className="w-8 h-8 rounded-control bg-glass border border-border text-text flex items-center justify-center hover:bg-glass-raised cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">skip_previous</span>
                  </div>
                  <div className="w-8 h-8 rounded-control bg-glass border border-border text-text flex items-center justify-center hover:bg-glass-raised cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">skip_next</span>
                  </div>
                </div>

                <div className="font-mono text-xs text-text-2">
                  <span className="text-text font-bold">Step 18</span> / 45
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-glass-sunken text-text-3">0.5x</span>
                  <span className="px-1.5 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent font-medium">1x</span>
                  <span className="px-1.5 py-0.5 rounded bg-glass-sunken text-text-3">2x</span>
                  <span className="px-1.5 py-0.5 rounded bg-glass-sunken text-text-3">4x</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-glass-sunken overflow-hidden border border-border relative">
                  <div className="h-full bg-accent rounded-full" style={{ width: '40%' }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-text-3">
                  <span>Start (Ln 1)</span>
                  <span>Swapping arr[j] &gt; arr[j+1] (Ln 6)</span>
                  <span>Sorted (Ln 9)</span>
                </div>
              </div>

              {/* Active line callout */}
              <div className="p-2.5 rounded-control bg-glass-sunken border border-border text-xs font-mono text-text-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-text font-semibold">Line 6:</span>
                <span>Swapped 34 and 25 at indices 1 and 2</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. VARIABLES & RECURSIVE CALL STACK
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Visual Preview */}
        <div className="lg:col-span-6 order-2 lg:order-1">
          <GlassPanel level={1} className="p-4 sm:p-5 rounded-panel border border-border shadow-panel flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-mono text-text-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <span className="text-text">Call Stack &amp; Scopes</span>
              </div>
              <span className="text-accent">STACK DEPTH: 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Stack frames */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-3">Stack Frames</span>
                
                {/* Frame #2 active */}
                <div className="p-2.5 rounded-inner bg-panel-body border-l-2 border-accent border-y border-r border-border flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text font-semibold">factorial(n=3)</span>
                    <span className="px-1.5 py-0.2 rounded bg-accent/20 text-accent text-[10px]">Active</span>
                  </div>
                  <span className="text-[11px] font-mono text-text-3">Line 4 • returning 3 * factorial(2)</span>
                </div>

                {/* Frame #1 */}
                <div className="p-2.5 rounded-inner bg-glass-sunken border border-border flex flex-col gap-1 opacity-75">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text">factorial(n=4)</span>
                    <span className="text-[10px] text-text-3">Caller</span>
                  </div>
                  <span className="text-[11px] font-mono text-text-3">Line 4 • waiting for return</span>
                </div>

                {/* Frame #0 */}
                <div className="p-2.5 rounded-inner bg-glass-sunken border border-border flex flex-col gap-1 opacity-50">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text">factorial(n=5)</span>
                    <span className="text-[10px] text-text-3">Root</span>
                  </div>
                  <span className="text-[11px] font-mono text-text-3">Line 7 • &lt;module&gt;</span>
                </div>
              </div>

              {/* Scope Variables */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-3">Active Scope Locals</span>
                <div className="p-3 rounded-inner bg-panel-body border border-border flex flex-col gap-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-text-3">n (int)</span>
                    <span className="text-accent font-semibold">3</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-text-3">base case</span>
                    <span className="text-text">False</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-3">pending</span>
                    <span className="text-sage">3 * factorial(2)</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Copy */}
        <div className="lg:col-span-6 flex flex-col gap-5 text-left order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-glass-sunken border border-border text-sage text-xs font-mono w-fit">
            <span>FEATURE 02</span>
            <span>•</span>
            <span>STACK TELEMETRY</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight leading-tight">
            Watch recursion build and unwind.
          </h3>

          <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
            Stop drawing recursion trees on paper. CodeTrace stacks each function frame with its
            own isolated scope, tracking parameter bindings and bubbling return values.
          </p>

          <ul className="space-y-2 text-sm text-text-2 font-sans">
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sage text-base">check_circle</span>
              <span>Inspect active and caller stack frames with one click.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sage text-base">check_circle</span>
              <span>Python-native formatting: None, True, and False values.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sage text-base">check_circle</span>
              <span>Watch call depths grow with recursive descent.</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              to="/workspace?preset=factorial-recursion"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sage hover:text-text transition-colors"
            >
              <span>Try it with Factorial Recursion</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. VIRTUAL HEAP & MEMORY REFERENCES
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Copy */}
        <div className="lg:col-span-6 flex flex-col gap-5 text-left order-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-glass-sunken border border-border text-accent text-xs font-mono w-fit">
            <span>FEATURE 03</span>
            <span>•</span>
            <span>VIRTUAL HEAP</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight leading-tight">
            Demystify pointers, lists, and dicts.
          </h3>

          <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
            Primitive variables hold values directly; containers live on the virtual heap.
            CodeTrace assigns clean labels (@1, @2) so multiple variables pointing to the same container are unmistakable.
          </p>

          <ul className="space-y-2 text-sm text-text-2 font-sans">
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>Readable labels like @1 and @2 remain stable across replays.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>Inspect list cells by index and dictionaries by key-value pairs.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>See multiple variables pointing to the same shared object.</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              to="/workspace?preset=two-sum"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              <span>Try it with Two Sum</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="lg:col-span-6 order-2">
          <GlassPanel level={1} className="p-4 sm:p-5 rounded-panel border border-border shadow-panel flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-mono text-text-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <span className="text-text">Virtual Heap Memory Inspector</span>
              </div>
              <span className="text-accent">2 OBJECTS ALLOCATED</span>
            </div>

            <div className="space-y-3">
              {/* Heap Card @1: Dict */}
              <div className="p-3.5 rounded-inner bg-panel-body border border-border flex flex-col gap-2 shadow-panel">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent font-mono text-xs font-bold">@1</span>
                    <span className="font-mono text-xs font-semibold text-text">seen (dict)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-3">
                    <span>Referenced by:</span>
                    <span className="text-accent">seen</span>
                  </div>
                </div>
                {/* Dict key-values */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-control bg-glass-sunken border border-border flex justify-between">
                    <span className="text-text-3">Key: 2</span>
                    <span className="text-sage">Val: 0</span>
                  </div>
                  <div className="p-2 rounded-control bg-glass-sunken border border-border flex justify-between">
                    <span className="text-text-3">Key: 7</span>
                    <span className="text-sage">Val: 1</span>
                  </div>
                </div>
              </div>

              {/* Heap Card @2: List */}
              <div className="p-3.5 rounded-inner bg-panel-body border border-border flex flex-col gap-2 shadow-panel">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-sage/20 border border-sage/40 text-sage font-mono text-xs font-bold">@2</span>
                    <span className="font-mono text-xs font-semibold text-text">numbers (list)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-3">
                    <span>Referenced by:</span>
                    <span className="text-sage">numbers, nums</span>
                  </div>
                </div>
                {/* List cells with indexes */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="p-1.5 rounded-control bg-glass-sunken border border-border">
                    <span className="text-[10px] text-text-3 block">[0]</span>
                    <span className="text-text font-bold">2</span>
                  </div>
                  <div className="p-1.5 rounded-control bg-glass-sunken border border-border">
                    <span className="text-[10px] text-text-3 block">[1]</span>
                    <span className="text-text font-bold">7</span>
                  </div>
                  <div className="p-1.5 rounded-control bg-glass-sunken border border-border">
                    <span className="text-[10px] text-text-3 block">[2]</span>
                    <span className="text-text font-bold">11</span>
                  </div>
                  <div className="p-1.5 rounded-control bg-glass-sunken border border-border">
                    <span className="text-[10px] text-text-3 block">[3]</span>
                    <span className="text-text font-bold">15</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. EMPIRICAL COMPLEXITY PROFILER
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Visual Preview */}
        <div className="lg:col-span-6 order-2 lg:order-1">
          <GlassPanel level={1} className="p-4 sm:p-5 rounded-panel border border-border shadow-panel flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-mono text-text-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <span className="text-text">Complexity Profiler (Empirical)</span>
              </div>
              <span className="text-accent font-semibold">ESTIMATED</span>
            </div>

            <div className="p-4 rounded-inner bg-panel-body border border-border flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text-3">Target:</span>
                  <span className="font-mono text-xs font-semibold text-text">bubble_sort(arr)</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent font-bold">
                    O(n²)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sage/20 border border-sage/40 text-sage text-[11px]">
                    High (98%)
                  </span>
                </div>
              </div>

              {/* Simulated Chart Plot */}
              <div className="h-32 w-full rounded-control bg-glass-sunken border border-border p-2 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between text-[10px] font-mono text-text-3">
                  <span>Operations (steps)</span>
                  <span>Fit: Quadratic O(n²)</span>
                </div>

                {/* SVG Curve */}
                <svg className="w-full h-20 overflow-visible" viewBox="0 0 300 80">
                  <path
                    d="M 10 75 Q 120 70 200 45 T 290 10"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                  />
                  {/* Scatter Points */}
                  <circle cx="20" cy="74" r="3.5" fill="var(--sage)" />
                  <circle cx="80" cy="70" r="3.5" fill="var(--sage)" />
                  <circle cx="160" cy="58" r="3.5" fill="var(--sage)" />
                  <circle cx="220" cy="40" r="3.5" fill="var(--sage)" />
                  <circle cx="280" cy="14" r="3.5" fill="var(--sage)" />
                </svg>

                <div className="flex justify-between text-[10px] font-mono text-text-3">
                  <span>N=5</span>
                  <span>N=10</span>
                  <span>N=20</span>
                  <span>N=40</span>
                  <span>N=80</span>
                </div>
              </div>

              {/* AST Hint */}
              <div className="text-[11px] font-mono text-text-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-accent">info</span>
                <span>AST detected: 2 nested loops over input length</span>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Copy */}
        <div className="lg:col-span-6 flex flex-col gap-5 text-left order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-glass-sunken border border-border text-accent text-xs font-mono w-fit">
            <span>FEATURE 04</span>
            <span>•</span>
            <span>EMPIRICAL BENCHMARK</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight leading-tight">
            Empirical Big-O curves, measured from real runs.
          </h3>

          <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
            Analyze runtime growth without hand-waving. CodeTrace benchmarks your function across increasing input sizes,
            fits standard Big-O mathematical curves, and reports confidence metrics.
          </p>

          <ul className="space-y-2 text-sm text-text-2 font-sans">
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>Curve fitting against O(1), O(log n), O(n), O(n²), and more.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>Benchmarks best, average, and worst case input distributions.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>AST hints detect loops, recursion, and built-in sorts.</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              to="/workspace?preset=bubble-sort"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              <span>Analyze Bubble Sort in Studio</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. SIDE-BY-SIDE DUAL COMPARISON
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Copy */}
        <div className="lg:col-span-6 flex flex-col gap-5 text-left order-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-glass-sunken border border-border text-sage text-xs font-mono w-fit">
            <span>FEATURE 05</span>
            <span>•</span>
            <span>DUAL COMPARISON</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight leading-tight">
            Benchmark two solutions head to head.
          </h3>

          <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
            Compare algorithmic approaches on identical inputs. Run a brute-force solution against
            an optimized hash map to see the exact step difference and operation efficiency.
          </p>

          <ul className="space-y-2 text-sm text-text-2 font-sans">
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sage text-base">check_circle</span>
              <span>Dual code editors for primary and alternative solutions.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sage text-base">check_circle</span>
              <span>Real-time operation counters and step efficiency bars.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sage text-base">check_circle</span>
              <span>Inspect full execution traces for either implementation.</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              to="/workspace?mode=compare"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sage hover:text-text transition-colors"
            >
              <span>Open Compare Mode</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="lg:col-span-6 order-2">
          <GlassPanel level={1} className="p-4 sm:p-5 rounded-panel border border-border shadow-panel flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-mono text-text-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <span className="text-text">Side-by-Side Dual Runner</span>
              </div>
              <span className="text-sage">CONCURRENT RUN COMPLETE</span>
            </div>

            <div className="p-4 rounded-inner bg-panel-body border border-border flex flex-col gap-3.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-text-3">Comparative Efficiency:</span>
                <span className="text-sage font-semibold">⚡ Solution A is 3.2x faster</span>
              </div>

              {/* Stat boxes */}
              <div className="grid grid-cols-2 gap-3 text-center font-mono">
                <div className="p-3 rounded-inner bg-glass-sunken border border-accent/40">
                  <span className="text-[10px] text-text-3 block">Solution A (Hash Map)</span>
                  <span className="text-xl font-bold text-accent">13 steps</span>
                </div>
                <div className="p-3 rounded-inner bg-glass-sunken border border-sage/40">
                  <span className="text-[10px] text-text-3 block">Solution B (Nested Loops)</span>
                  <span className="text-xl font-bold text-sage">42 steps</span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-2 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-text-3">
                    <span>Solution A</span>
                    <span className="text-accent">13 ops</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-glass-sunken overflow-hidden border border-border">
                    <div className="h-full bg-accent rounded-full" style={{ width: '31%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-text-3">
                    <span>Solution B</span>
                    <span className="text-sage">42 ops</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-glass-sunken overflow-hidden border border-border">
                    <div className="h-full bg-sage rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. ACTIVE RECALL WITH PREDICT MODE
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Visual Preview */}
        <div className="lg:col-span-6 order-2 lg:order-1">
          <GlassPanel level={1} className="p-4 sm:p-5 rounded-panel border border-border shadow-panel flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-mono text-text-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <span className="text-text">Predict Mode (Active Recall)</span>
              </div>
              <span className="text-accent font-semibold">CURATED PRESETS</span>
            </div>

            <div className="p-4 rounded-inner bg-panel-body border border-border flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="font-mono text-xs text-text-3">Step 4 • Two Sum</span>
                <span className="px-2 py-0.5 rounded-full bg-glass border border-border text-text font-mono text-xs">
                  🔥 3 Streak
                </span>
              </div>

              <p className="text-xs font-sans text-text font-medium leading-relaxed">
                What value will <code className="text-accent">diff</code> receive on this execution step?
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-control bg-glass-sunken border border-border text-text-3 flex items-center justify-between opacity-60">
                  <span>[A] diff = 9</span>
                </div>
                <div className="p-2.5 rounded-control bg-sage-soft border border-sage/60 text-sage flex items-center justify-between font-medium">
                  <span>[B] diff = 7 (Target 9 - Num 2)</span>
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                </div>
                <div className="p-2.5 rounded-control bg-glass-sunken border border-border text-text-3 flex items-center justify-between opacity-60">
                  <span>[C] diff = -7</span>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Copy */}
        <div className="lg:col-span-6 flex flex-col gap-5 text-left order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-glass-sunken border border-border text-accent text-xs font-mono w-fit">
            <span>FEATURE 06</span>
            <span>•</span>
            <span>ACTIVE RECALL</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight leading-tight">
            Active recall: predict before you execute.
          </h3>

          <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
            Test your mental model of code execution. On curated presets, execution pauses
            before key steps, prompting you to guess the next value before stepping forward.
          </p>

          <ul className="space-y-2 text-sm text-text-2 font-sans">
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>Immediate feedback on variable values and condition checks.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>Streak counter rewards consecutive correct predictions.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-accent text-base">check_circle</span>
              <span>Curated questions on Two Sum, Factorial, and Bubble Sort.</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              to="/workspace?preset=two-sum&mode=predict"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              <span>Try Predict Mode on Two Sum</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. CUSTOM CODE & PERMALINK SHARING
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Copy */}
        <div className="lg:col-span-6 flex flex-col gap-5 text-left order-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-glass-sunken border border-border text-sage text-xs font-mono w-fit">
            <span>FEATURE 07</span>
            <span>•</span>
            <span>PERMALINK SHARING</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight leading-tight">
            Run your own code and share reproducible traces.
          </h3>

          <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
            Paste any Python snippet using standard libraries. Generate a unique permalink to share
            your exact code and execution replay with a mentor, classmate, or colleague.
          </p>

          <ul className="space-y-2 text-sm text-text-2 font-sans">
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sage text-base">check_circle</span>
              <span>Monaco editor with syntax highlighting and auto-indent.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sage text-base">check_circle</span>
              <span>One-click permalinks stored securely in PostgreSQL.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sage text-base">check_circle</span>
              <span>Recipients see the identical code ready to run.</span>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              to="/workspace"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sage hover:text-text transition-colors"
            >
              <span>Open Studio with Blank Script</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="lg:col-span-6 order-2">
          <GlassPanel level={1} className="p-4 sm:p-5 rounded-panel border border-border shadow-panel flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-mono text-text-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <span className="text-text">Snapshot Sharing</span>
              </div>
              <span className="text-sage">READY TO SHARE</span>
            </div>

            <div className="p-4 rounded-inner bg-panel-body border border-border flex flex-col gap-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-3">Generated Permalink:</span>
                <span className="text-accent">Snippet #8f4a12c9</span>
              </div>

              <div className="p-2.5 rounded-control bg-glass-sunken border border-border text-text flex items-center justify-between">
                <span className="truncate pr-2">https://codetrace.app/?snippet=8f4a12c9</span>
                <span className="px-2 py-0.5 rounded bg-sage/20 text-sage text-[11px] font-bold shrink-0">Copied</span>
              </div>

              <div className="text-[11px] text-text-3 leading-relaxed">
                Anyone with this link receives the full code snapshot and can replay the exact step-by-step trace in their own browser.
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </section>
  )
}
