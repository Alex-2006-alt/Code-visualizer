import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SegmentedControl, Tabs, GlassButton } from '@/components/ui'
import {
  CodeEditor,
  VariablesTable,
  CallStack,
  MemoryHeap,
  OutputTerminal,
  TimelineBar,
  PredictQuizCard,
  ComplexityMeter,
} from '@/components/workspace'
import { useTraceStore, ExecutionMode } from '@/store/useTraceStore'
import { PRESETS } from '@/mocks'

export const WorkspacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const qMode = searchParams.get('mode') as ExecutionMode
  const mode = qMode && ['visualize', 'predict', 'compare'].includes(qMode) ? qMode : 'visualize'

  const [mobileTab, setMobileTab] = useState('editor')

  const {
    code,
    steps,
    currentStep,
    isPlaying,
    speed,
    currentPreset,
    streak,
    selectedAnswer,
    answerFeedback,
    setCode,
    nextStep,
    prevStep,
    togglePlay,
    setSpeed,
    setCurrentStep,
    resetExecution,
    setMode,
    loadPreset,
    submitPredictAnswer,
  } = useTraceStore()

  // Sync mode with store
  useEffect(() => {
    setMode(mode)
  }, [mode, setMode])

  // Global Keyboard shortcuts: Space (play/pause), ArrowLeft (prev), ArrowRight (next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return

      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        nextStep()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        prevStep()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, nextStep, prevStep])

  const step = useMemo(() => steps[currentStep] || steps[0], [steps, currentStep])
  const activeFrame = useMemo(() => {
    if (!step?.stack || step.stack.length === 0) return null
    return step.stack[step.stack.length - 1]
  }, [step])

  const handleModeChange = (newMode: ExecutionMode) => {
    setSearchParams(newMode === 'visualize' ? {} : { mode: newMode })
  }

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem)] pb-28 select-none">
      {/* Workspace Cockpit Sub-Header */}
      <div className="w-full px-4 sm:px-6 py-2.5 bg-container-lowest/80 border-b border-border-subtle backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Preset Selector */}
          <select
            value={currentPreset.id}
            onChange={(e) => loadPreset(e.target.value)}
            className="bg-bg-surface/80 border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-semibold text-text-primary focus:outline-none focus:border-cyan/50 cursor-pointer"
          >
            {Object.values(PRESETS).map((p) => (
              <option key={p.id} value={p.id} className="bg-bg-surface text-text-primary">
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>

          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-border-subtle text-text-tertiary text-[11px] font-mono">
            CPython 3.12
          </span>
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
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                🔥 {streak} Streak
              </span>
            </div>
          )}

          <GlassButton
            variant="primary"
            size="sm"
            onClick={resetExecution}
            leftIcon={<span className="material-symbols-outlined text-[16px]">restart_alt</span>}
          >
            Restart
          </GlassButton>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden px-4 pt-3">
        <Tabs
          variant="pill"
          activeTab={mobileTab}
          onChange={setMobileTab}
          tabs={[
            { id: 'editor', label: 'Editor' },
            { id: 'diagnostics', label: 'State & Stack' },
            { id: 'heap', label: 'Heap' },
          ]}
        />
      </div>

      {/* Main Multi-Pane Visualizer Grid */}
      <div className="flex-1 w-full px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Monaco Code Editor & Quiz (12 cols mobile, 5 cols desktop) */}
        <div
          className={`flex flex-col gap-4 lg:col-span-5 ${
            mobileTab !== 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <CodeEditor
            code={code}
            currentLine={step?.line || 1}
            onChange={(newCode) => setCode(newCode || '')}
            height="440px"
          />

          {mode === 'predict' && (
            <PredictQuizCard
              question={step?.predict}
              selectedAnswer={selectedAnswer}
              feedback={answerFeedback}
              streak={streak}
              onSelectOption={submitPredictAnswer}
              onNextStep={nextStep}
            />
          )}

          <ComplexityMeter
            timeComplexity={currentPreset.timeComplexity}
            spaceComplexity={currentPreset.spaceComplexity}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        </div>

        {/* Right Column: Execution State Panels (12 cols mobile, 7 cols desktop) */}
        <div
          className={`flex flex-col gap-4 lg:col-span-7 ${
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Live Variables Watch */}
            <div className="md:col-span-7 h-64">
              <VariablesTable
                locals={activeFrame?.locals || {}}
                mutatedVariable={step?.mutatedVariable}
              />
            </div>

            {/* Call Stack */}
            <div className="md:col-span-5 h-64">
              <CallStack stack={step?.stack || []} event={step?.event} />
            </div>
          </div>

          {/* Virtual Heap Graph */}
          <div className="h-64">
            <MemoryHeap objects={step?.heapObjects || []} />
          </div>

          {/* Output Terminal */}
          <OutputTerminal
            stdout={step?.output || ''}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        </div>
      </div>

      {/* Bottom Floating Timeline Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-3xl">
        <TimelineBar
          currentStep={currentStep}
          totalSteps={steps.length}
          isPlaying={isPlaying}
          speed={speed}
          onPlayToggle={togglePlay}
          onNext={nextStep}
          onPrev={prevStep}
          onReset={resetExecution}
          onStepChange={setCurrentStep}
          onSpeedChange={setSpeed}
        />
      </div>
    </div>
  )
}
