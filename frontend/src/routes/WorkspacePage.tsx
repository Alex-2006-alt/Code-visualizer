import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GlassPanel, GlassButton, SegmentedControl, Tabs } from '@/components/ui'

export const WorkspacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const qMode = searchParams.get('mode') as 'visualize' | 'predict' | 'compare'
  const mode = qMode && ['visualize', 'predict', 'compare'].includes(qMode) ? qMode : 'visualize'

  const [mobileTab, setMobileTab] = useState('code')
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(4)
  const totalSteps = 18

  const handleModeChange = (newMode: 'visualize' | 'predict' | 'compare') => {
    setSearchParams(newMode === 'visualize' ? {} : { mode: newMode })
  }

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem)] pb-28 select-none">
      {/* Workspace Cockpit Sub-Header */}
      <div className="w-full px-4 sm:px-6 py-2.5 bg-surface-container-lowest/80 border-b border-white/[0.08] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_#5de6ff] animate-pulse" />
            <span className="font-headline-sm text-sm sm:text-base font-semibold text-white">
              Two Sum
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-outline text-[11px] font-code-sm">
              LeetCode #1
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high/60 border border-white/5 font-code-sm text-xs text-secondary">
            <span>CPython 3.12</span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <SegmentedControl
          size="sm"
          value={mode}
          onChange={handleModeChange}
          options={[
            { value: 'visualize', label: 'Visualize' },
            { value: 'predict', label: 'Predict' },
            { value: 'compare', label: 'Compare' },
          ]}
        />

        {/* Telemetry Actions */}
        <div className="flex items-center gap-2">
          {mode === 'predict' && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-code-sm">
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary border border-tertiary/30">
                5 Streak 🔥
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary border border-secondary/30">
                92% Acc 🎯
              </span>
            </div>
          )}

          {mode === 'compare' && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-code-sm">
              <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-secondary">
                Δ Speedup: 3.4x
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-container/30 text-primary">
                Memory: -42%
              </span>
            </div>
          )}

          <GlassButton
            variant="primary"
            size="sm"
            leftIcon={<span className="material-symbols-outlined text-[16px]">play_arrow</span>}
          >
            Run
          </GlassButton>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible on < 768px) */}
      <div className="md:hidden px-4 pt-3">
        <Tabs
          variant="pill"
          activeTab={mobileTab}
          onChange={setMobileTab}
          tabs={[
            { id: 'code', label: 'Code' },
            { id: 'stack', label: 'Stack' },
            { id: 'heap', label: 'Heap' },
          ]}
        />
      </div>

      {/* MAIN COCKPIT: 390px (Mobile Stack) / 768px (Tablet Split) / 1440px (3-Pane Cockpit) */}
      <div className="flex-1 w-full px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Column: Monaco Code Editor Stage (12 cols mobile, 6 cols tablet, 5 cols desktop) */}
        <div
          className={`flex flex-col gap-3 md:col-span-6 xl:col-span-5 ${
            mobileTab !== 'code' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <GlassPanel level={2} className="w-full flex flex-col overflow-hidden shadow-2xl">
            {/* Editor titlebar */}
            <div className="px-4 py-2 bg-surface-container-high/60 border-b border-white/5 flex items-center justify-between text-xs font-code-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-white font-medium">two_sum.py</span>
              </div>
              <span className="text-secondary font-mono text-[11px]">Ln 5, Col 4</span>
            </div>

            {/* Code Body Placeholder */}
            <div className="p-4 font-code-sm text-xs leading-relaxed space-y-1 bg-surface-container-lowest/90 overflow-x-auto min-h-[360px]">
              <div className="text-on-surface-variant"><span className="text-tertiary">def</span> <span className="text-secondary font-medium">two_sum</span>(nums, target):</div>
              <div className="pl-4 text-on-surface">seen = &#123;&#125;</div>
              <div className="pl-4 text-on-surface-variant"><span className="text-tertiary">for</span> i, num <span className="text-tertiary">in</span> <span className="text-secondary">enumerate</span>(nums):</div>
              <div className="pl-8 text-on-surface">diff = target - num</div>
              {/* Highlight active step */}
              <div className="pl-8 py-1 -mx-2 px-2 bg-secondary/15 rounded text-white border-l-2 border-secondary shadow-[0_0_16px_rgba(93,230,255,0.25)] flex items-center justify-between">
                <span>if diff in seen:</span>
                <span className="px-2 py-0.2 rounded-full bg-secondary-container/30 text-secondary text-[10px]">
                  evaluates TRUE
                </span>
              </div>
              <div className="pl-12 text-on-surface-variant"><span className="text-tertiary">return</span> [seen[diff], i]</div>
              <div className="pl-8 text-on-surface">seen[num] = i</div>
            </div>
          </GlassPanel>

          {/* Predict Mode Overlay Card if active */}
          {mode === 'predict' && (
            <GlassPanel level={3} glow="primary" className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-primary uppercase">Mystery Checkpoint</span>
                <span className="font-code-sm text-secondary text-xs">+25 XP</span>
              </div>
              <p className="font-body-sm text-xs text-white">
                What will the condition <code className="text-secondary">diff in seen</code> evaluate to?
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button className="py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-code-sm text-white border border-white/10">
                  True
                </button>
                <button className="py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-code-sm text-white border border-white/10">
                  False
                </button>
                <button className="py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-code-sm text-white border border-white/10">
                  KeyError
                </button>
              </div>
            </GlassPanel>
          )}
        </div>

        {/* Right Column: Diagnostic Cockpit (12 cols mobile, 6 cols tablet, 7 cols desktop) */}
        <div
          className={`flex flex-col gap-4 md:col-span-6 xl:col-span-7 ${
            mobileTab === 'code' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Variables Table & Stack Frames */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Variables Watch */}
            <GlassPanel level={1} className="p-4 xl:col-span-7 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-xs font-semibold text-white">Live Variables</span>
                <span className="font-code-sm text-[10px] text-secondary bg-surface-container px-2 py-0.5 rounded-full">
                  Scope: Local
                </span>
              </div>
              <div className="space-y-1.5 font-code-sm text-xs">
                <div className="flex justify-between p-1.5 rounded bg-surface-container-lowest/80">
                  <span className="text-primary font-medium">nums</span>
                  <span className="text-on-surface">[2, 7, 11, 15]</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-surface-container-lowest/80">
                  <span className="text-primary font-medium">target</span>
                  <span className="text-on-surface">9</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300">
                  <span className="font-bold">diff</span>
                  <span className="font-bold">2 ⚡</span>
                </div>
              </div>
            </GlassPanel>

            {/* Call Stack */}
            <GlassPanel level={1} className="p-4 xl:col-span-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-xs font-semibold text-white">Call Stack</span>
                <span className="font-code-sm text-[10px] text-primary">Depth: 1</span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-high/90 border border-primary/30 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-code-sm text-xs font-bold text-white">two_sum()</span>
                  <span className="font-label-caps text-[9px] text-primary">ACTIVE</span>
                </div>
                <span className="font-code-sm text-[10px] text-outline">Line 5 • PC: 0x00A4</span>
              </div>
            </GlassPanel>
          </div>

          {/* Virtual Heap Graph */}
          <GlassPanel level={1} className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-xs font-semibold text-white">Virtual Heap Objects</span>
              <span className="font-code-sm text-[10px] text-outline">64-bit CPython Arena</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-surface-container-lowest/90 border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between font-code-sm text-[10px] text-secondary">
                  <span>nums: list@0x7ffe82c0</span>
                  <span className="text-outline">len=4</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center font-code-sm text-xs">
                  <span className="p-1 rounded bg-surface-container">2</span>
                  <span className="p-1 rounded bg-secondary-container/30 text-secondary font-bold">7</span>
                  <span className="p-1 rounded bg-surface-container">11</span>
                  <span className="p-1 rounded bg-surface-container">15</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest/90 border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between font-code-sm text-[10px] text-tertiary">
                  <span>seen: dict@0x7ffe14a</span>
                  <span className="text-outline">size=1</span>
                </div>
                <div className="p-1.5 rounded bg-surface-container font-code-sm text-xs text-center text-primary">
                  &#123; 2: 0 &#125;
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Collapsible Output Terminal Drawer */}
          <GlassPanel level={2} className="p-3 flex flex-col gap-2">
            <button
              onClick={() => setTerminalOpen(!terminalOpen)}
              className="flex items-center justify-between w-full text-xs font-code-sm text-on-surface-variant hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                stdout / Runtime Telemetry
              </span>
              <span className="text-outline text-[11px]">{terminalOpen ? 'Collapse' : 'Expand'}</span>
            </button>
            {terminalOpen && (
              <div className="p-2.5 rounded bg-surface-container-lowest font-code-sm text-[11px] text-outline space-y-1">
                <div>[Step 01] Initializing CPython VM frame &lt;module&gt;</div>
                <div className="text-white">[Step 04] Iteration index 1: num=7, target=9</div>
                <div className="text-secondary">[Step 05] Hash table hit: seen[2] exists!</div>
              </div>
            )}
          </GlassPanel>
        </div>
      </div>

      {/* Floating Timeline Dock (Bottom Anchored) */}
      <aside className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl px-4 py-2.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-2xl border border-white/15 shadow-glass-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            aria-label="Previous step"
            className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">skip_previous</span>
          </button>
          <button
            aria-label="Play or pause"
            className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-glow-primary"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
            aria-label="Next step"
            className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">skip_next</span>
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
            <div
              className="h-full bg-secondary shadow-[0_0_10px_#5de6ff] rounded-full"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <span className="font-code-sm text-[11px] text-secondary shrink-0">
            STEP {String(currentStep).padStart(2, '0')} / {totalSteps}
          </span>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-code-sm text-[11px] shrink-0">
          1.0x
        </span>
      </aside>
    </div>
  )
}
