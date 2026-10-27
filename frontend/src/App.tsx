import React, { useState } from 'react'
import { BackgroundCanvas } from '@/components/layout/BackgroundCanvas'
import {
  GlassPanel,
  GlassButton,
  Chip,
  SegmentedControl,
  Tabs,
  Slider,
  Tooltip,
  ToastContainer,
  toast,
  Modal,
  BottomSheet,
} from '@/components/ui'

export const App: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'visualize' | 'predict' | 'compare'>('visualize')
  const [activeTab, setActiveTab] = useState('code')
  const [sliderVal, setSliderVal] = useState(4)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [chipSelected, setChipSelected] = useState(true)

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between text-on-surface">
      <BackgroundCanvas />
      <ToastContainer />

      {/* Header Bar */}
      <header className="relative z-20 w-full h-16 border-b border-white/10 bg-surface/70 backdrop-blur-2xl px-space-md sm:px-space-lg flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-white/10 flex items-center justify-center shadow-[0_0_12px_rgba(202,190,255,0.3)]">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              terminal
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm font-semibold tracking-tight text-white leading-none">
              CodeTrace
            </span>
            <span className="font-label-caps text-secondary uppercase tracking-wider text-[10px] mt-0.5">
              UI Component Rig Active
            </span>
          </div>
        </div>

        {/* Segmented Control in Navbar */}
        <SegmentedControl
          size="sm"
          value={activeSegment}
          onChange={setActiveSegment}
          options={[
            { value: 'visualize', label: 'Visualize' },
            { value: 'predict', label: 'Predict' },
            { value: 'compare', label: 'Compare' },
          ]}
        />

        <div className="flex items-center gap-2">
          <GlassButton
            size="sm"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
          >
            Open Modal
          </GlassButton>
        </div>
      </header>

      {/* Main UI Gallery */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-space-md py-space-xl flex flex-col gap-space-lg">
        {/* Intro Banner */}
        <GlassPanel level={1} className="p-space-lg flex flex-col gap-space-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="font-headline-xl text-white">Phase 2: UI Component Library</h1>
            <span className="font-code-sm text-secondary bg-surface-container px-3 py-1 rounded-full border border-white/10">
              10 REUSABLE PRIMITIVES
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant max-w-3xl">
            Fully typed, accessible components designed for the obsidian glassmorphism aesthetic.
            Includes hover, active, focus-visible, and disabled interaction states.
          </p>
        </GlassPanel>

        {/* Section 1: GlassButtons Matrix */}
        <GlassPanel level={2} className="p-space-lg flex flex-col gap-space-md">
          <span className="font-label-caps text-secondary uppercase tracking-wider">
            01. GlassButton States & Variants
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
            <div className="flex flex-col gap-2">
              <span className="font-code-sm text-outline">Primary (Glow)</span>
              <GlassButton variant="primary" glow>Step Forward</GlassButton>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-code-sm text-outline">Secondary (Frosted)</span>
              <GlassButton variant="secondary">Inspect Heap</GlassButton>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-code-sm text-outline">Ghost / Subtle</span>
              <GlassButton variant="ghost">Settings</GlassButton>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-code-sm text-outline">Danger / Exception</span>
              <GlassButton variant="danger">Reset Trace</GlassButton>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center pt-2 border-t border-white/5">
            <div className="flex flex-col gap-2">
              <span className="font-code-sm text-outline">Loading State</span>
              <GlassButton variant="primary" isLoading>Compiling</GlassButton>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-code-sm text-outline">Disabled State</span>
              <GlassButton variant="secondary" disabled>Disabled</GlassButton>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-code-sm text-outline">Icon Only (Aria)</span>
              <GlassButton size="icon" aria-label="Play execution">
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              </GlassButton>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-code-sm text-outline">With Tooltip</span>
              <Tooltip content="Keyboard shortcut: Spacebar" position="top">
                <GlassButton variant="secondary">Hover Me ?</GlassButton>
              </Tooltip>
            </div>
          </div>
        </GlassPanel>

        {/* Section 2: Chips & Tabs & Slider */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {/* Chips */}
          <GlassPanel level={1} className="p-space-lg flex flex-col gap-space-sm justify-between">
            <span className="font-label-caps text-secondary uppercase tracking-wider">
              02. Filter Chips
            </span>
            <div className="flex flex-wrap gap-2 pt-2">
              <Chip
                label="All Categories"
                count={42}
                active={chipSelected}
                onClick={() => setChipSelected(!chipSelected)}
              />
              <Chip label="Arrays & Hash" count={12} variant="primary" active />
              <Chip label="Two Pointers" count={8} variant="secondary" />
              <Chip label="Recursion" count={7} variant="tertiary" active />
              <Chip label="Disabled Tag" count={0} disabled />
            </div>
          </GlassPanel>

          {/* Slider & Scrubber */}
          <GlassPanel level={1} className="p-space-lg flex flex-col gap-space-sm justify-between">
            <span className="font-label-caps text-secondary uppercase tracking-wider">
              03. Timeline Scrubber Slider
            </span>
            <Slider
              min={1}
              max={18}
              value={sliderVal}
              onChange={setSliderVal}
              label="Interactive Playback Step"
              formatValue={(val) => `Step ${val} / 18`}
            />
          </GlassPanel>
        </div>

        {/* Section 3: Tabs & Triggerable Toasts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {/* Tabs */}
          <GlassPanel level={2} className="p-space-md flex flex-col gap-space-sm">
            <span className="font-label-caps text-secondary uppercase tracking-wider">
              04. Multi-Pane Tabs
            </span>
            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={[
                { id: 'code', label: 'solution.py', badge: 'Active' },
                { id: 'stack', label: 'Call Stack', badge: '2' },
                { id: 'heap', label: 'Heap Graph' },
              ]}
            >
              <div className="p-space-sm rounded-lg bg-surface-container-lowest/80 font-code-sm text-on-surface-variant min-h-[60px] flex items-center">
                {activeTab === 'code' && 'def two_sum(nums, target): # Active Python 3.12'}
                {activeTab === 'stack' && 'Frame 0: two_sum(nums=[2, 7, 11], target=9)'}
                {activeTab === 'heap' && 'PyListObject @ 0x7ffe82c0, PyDictObject @ 0x7ffe14a'}
              </div>
            </Tabs>
          </GlassPanel>

          {/* Toast Triggers */}
          <GlassPanel level={2} className="p-space-md flex flex-col gap-space-sm">
            <span className="font-label-caps text-secondary uppercase tracking-wider">
              05. Toast Notification Triggers
            </span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <GlassButton
                size="sm"
                variant="secondary"
                onClick={() =>
                  toast.warning('Step Limit Exceeded', 'Terminated at 1,000 steps to protect thread.', {
                    actionLabel: 'Configure',
                  })
                }
              >
                Trigger Warning
              </GlassButton>
              <GlassButton
                size="sm"
                variant="danger"
                onClick={() =>
                  toast.error('Rate Limit Engaged', 'Cooldown active: 30 AST compiles/min.')
                }
              >
                Trigger Error
              </GlassButton>
              <GlassButton
                size="sm"
                variant="primary"
                onClick={() =>
                  toast.success('Checkpoint Stored', 'Memory heap serialized (64KB).')
                }
              >
                Trigger Success
              </GlassButton>
              <GlassButton
                size="sm"
                variant="ghost"
                onClick={() => setIsSheetOpen(true)}
              >
                Open BottomSheet
              </GlassButton>
            </div>
          </GlassPanel>
        </div>
      </main>

      {/* Modal Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Diagnostic Execution Modal"
        description="This modal validates backdrop blur, focus trapping, and spring motion."
      >
        <div className="space-y-4">
          <p className="font-body-md text-on-surface">
            CPython VM isolate thread allocated 24.8MB memory. Breakpoints are active on lines 5 and 7.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <GlassButton variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => {
                toast.success('Configuration Applied')
                setIsModalOpen(false)
              }}
            >
              Confirm
            </GlassButton>
          </div>
        </div>
      </Modal>

      {/* BottomSheet Demo */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Mobile Execution Drawer"
      >
        <div className="space-y-3 font-code-sm text-on-surface-variant">
          <p>Scrubber controls and telemetry drawer docked for touch devices.</p>
          <div className="flex justify-end">
            <GlassButton size="sm" variant="secondary" onClick={() => setIsSheetOpen(false)}>
              Close
            </GlassButton>
          </div>
        </div>
      </BottomSheet>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 py-space-sm px-space-lg text-center font-code-sm text-outline">
        CodeTrace UI Component Library • Phase 2 Complete
      </footer>
    </div>
  )
}

export default App
