import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SegmentedControl, Tabs, GlassButton, Select } from '@/components/ui'
import {
  CodeEditor,
  VariablesTable,
  CallStack,
  MemoryHeap,
  OutputTerminal,
  TimelineBar,
  PredictQuizCard,
  ComplexityMeter,
  StdinDrawer,
  ExportModal,
} from '@/components/workspace'
import { EventLogDrawer } from '@/components/workspace/EventLogDrawer'
import { KeyboardShortcutsModal } from '@/components/workspace/KeyboardShortcutsModal'
import { FEATURES } from '@/config/features'
import { useTraceStore, ExecutionMode } from '@/store/useTraceStore'
import { PRESETS } from '@/mocks'
import { isMockMode, createSnippet, fetchSnippet, compareCode, CompareResult } from '@/lib/api'
import { buildAddressLabelMap, generateStepExplanation } from '@/lib/formatters'
import { toast } from '@/components/ui/toastStore'

const DEFAULT_CODE_B = `def factorial_iterative(n):
    res = 1
    for i in range(1, n + 1):
        res *= i
    return res

print(factorial_iterative(5))`

export const WorkspacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const qMode = searchParams.get('mode') as ExecutionMode
  const mode = qMode && ['visualize', 'predict', 'compare'].includes(qMode) ? qMode : 'visualize'

  const [mobileTab, setMobileTab] = useState('editor')
  const [isSharing, setIsSharing] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [codeB, setCodeB] = useState(DEFAULT_CODE_B)
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null)
  const [isEventLogOpen, setIsEventLogOpen] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [isStdinOpen, setIsStdinOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [helpModalTab, setHelpModalTab] = useState<'shortcuts' | 'modules'>('shortcuts')

  const {
    code,
    steps,
    currentStep,
    isPlaying,
    isLoading,
    isTraceOutdated,
    speed,
    currentPreset,
    isTruncated,
    streak,
    selectedAnswer,
    answerFeedback,
    breakpoints,
    stdin,
    setCode,
    selectCustom,
    setSteps,
    nextStep,
    prevStep,
    togglePlay,
    setSpeed,
    setCurrentStep,
    resetExecution,
    runCurrentCode,
    setMode,
    loadPreset,
    submitPredictAnswer,
    toggleBreakpoint,
    stepInto,
    stepOver,
    stepOut,
    nextCall,
    continueToBreakpoint,
    restart,
  } = useTraceStore()

  // Sync mode with store
  useEffect(() => {
    setMode(mode)
  }, [mode, setMode])

  // Load preset or shared snippet from URL query parameters (?preset=id or ?snippet=id, plus ?step=n)
  useEffect(() => {
    const rawPreset = searchParams.get('preset')
    const presetId = rawPreset === 'factorial' ? 'factorial-recursion' : rawPreset
    const snippetId = searchParams.get('snippet')
    const stepParam = searchParams.get('step')
    const targetStep = stepParam !== null ? parseInt(stepParam, 10) : null

    if (presetId && PRESETS[presetId]) {
      loadPreset(presetId)
      if (targetStep !== null && !isNaN(targetStep)) {
        runCurrentCode().then(() => {
          const s = useTraceStore.getState()
          if (s.steps && s.steps.length > 0) {
            const clamped = Math.max(0, Math.min(targetStep, s.steps.length - 1))
            setCurrentStep(clamped)
          }
        })
      }
    } else if (snippetId) {
      fetchSnippet(snippetId).then((fetchedCode) => {
        if (fetchedCode) {
          setCode(fetchedCode)
          toast.info('Snippet Loaded', `Loaded shared snippet '${snippetId}'`)
          runCurrentCode().then(() => {
            if (targetStep !== null && !isNaN(targetStep)) {
              const s = useTraceStore.getState()
              if (s.steps && s.steps.length > 0) {
                const clamped = Math.max(0, Math.min(targetStep, s.steps.length - 1))
                setCurrentStep(clamped)
              }
            }
          })
        }
      })
    } else if (targetStep !== null && !isNaN(targetStep)) {
      runCurrentCode().then(() => {
        const s = useTraceStore.getState()
        if (s.steps && s.steps.length > 0) {
          const clamped = Math.max(0, Math.min(targetStep, s.steps.length - 1))
          setCurrentStep(clamped)
        }
      })
    }
  }, [searchParams, setCode, loadPreset, runCurrentCode, setCurrentStep])

  // Breakpoint step indices on the current trace
  const breakpointStepIndices = useMemo(() => {
    if (!breakpoints || breakpoints.length === 0 || steps.length === 0) return []
    const bpSet = new Set(breakpoints)
    const indices: number[] = []
    steps.forEach((s, idx) => {
      if (bpSet.has(s.line)) {
        indices.push(idx)
      }
    })
    return indices
  }, [breakpoints, steps])

  // Global Keyboard shortcuts: Space, ArrowLeft, ArrowRight, F10, F11, Shift+F11, F8
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      } else if (FEATURES.DEBUGGER_CONTROLS) {
        if (e.code === 'F10') {
          e.preventDefault()
          stepOver()
        } else if (e.code === 'F11' && e.shiftKey) {
          e.preventDefault()
          stepOut()
        } else if (e.code === 'F11') {
          e.preventDefault()
          stepInto()
        } else if (e.code === 'F8') {
          e.preventDefault()
          continueToBreakpoint()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, nextStep, prevStep, stepOver, stepInto, stepOut, continueToBreakpoint])

  const step = useMemo(() => steps[currentStep] || steps[0], [steps, currentStep])
  const activeFrame = useMemo(() => {
    if (!step?.stack || step.stack.length === 0) return null
    return step.stack[step.stack.length - 1]
  }, [step])

  // Stable friendly reference labels (@1, @2, @3) across the entire trace
  const addressLabels = useMemo(() => {
    return buildAddressLabelMap(steps)
  }, [steps])

  // Dynamic explanation generated from real execution step and source line
  const activeExplanation = useMemo(() => {
    if (isTraceOutdated) return null
    if (!step || step.event === 'exception') return null

    // If an unedited preset is active and specifically provided a custom explanation
    if (currentPreset && !isTraceOutdated && step.explanation) {
      return step.explanation
    }

    return generateStepExplanation(
      step,
      code,
      activeFrame,
      step.heap,
      step.heapObjects,
      isTraceOutdated
    )
  }, [step, code, activeFrame, isTraceOutdated, currentPreset])

  const handleModeChange = (newMode: ExecutionMode) => {
    setSearchParams(newMode === 'visualize' ? {} : { mode: newMode })
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)
      const snippetId = await createSnippet(code)
      if (snippetId) {
        const hasStep = steps.length > 0 && currentStep >= 0
        const stepQuery = hasStep ? `&step=${currentStep}` : ''
        const shareUrl = `${window.location.origin}/workspace?snippet=${snippetId}${stepQuery}`
        await navigator.clipboard.writeText(shareUrl).catch(() => {})
        setSearchParams(hasStep ? { snippet: snippetId, step: String(currentStep) } : { snippet: snippetId })
        toast.success('Share Link Created', `Link copied: ${shareUrl}`)
      }
    } catch {
      // toast already fired in createSnippet
    } finally {
      setIsSharing(false)
    }
  }

  const handleCompare = async () => {
    try {
      setIsComparing(true)
      const result = await compareCode(code, codeB, { stdin })
      setCompareResult(result)
      toast.success(
        'Comparison Complete',
        `Solution A: ${result.step_counts.a} steps vs Solution B: ${result.step_counts.b} steps`
      )
    } catch {
      // toast already fired
    } finally {
      setIsComparing(false)
    }
  }

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem)] pb-28 select-none">
      {/* Workspace Cockpit Sub-Header */}
      <div className="w-full px-4 sm:px-6 py-2.5 bg-glass border-b border-border backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Preset Selector */}
          <Select
            value={currentPreset ? currentPreset.id : 'custom'}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                selectCustom()
              } else {
                loadPreset(e.target.value)
              }
            }}
            aria-label="Select Python preset"
          >
            <option value="custom" className="bg-bg text-text">
              Custom Script
            </option>
            {Object.values(PRESETS).map((p) => (
              <option key={p.id} value={p.id} className="bg-bg text-text">
                {p.title} ({p.difficulty})
              </option>
            ))}
          </Select>

          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-glass text-text-3 text-[11px] font-mono border border-border">
            CPython 3.12
          </span>

          {isMockMode && (
            <span
              data-testid="mock-data-badge"
              className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-medium flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Mock Data
            </span>
          )}
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
              <span className="px-2.5 py-0.5 rounded-full bg-glass border border-border text-text-2">
                🔥 {streak} Streak
              </span>
            </div>
          )}

          {FEATURES.STDIN_PANEL && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => setIsStdinOpen(!isStdinOpen)}
              data-testid="btn-toggle-stdin"
              leftIcon={<span className="material-symbols-outlined text-[16px]">input</span>}
              aria-label="Toggle standard input drawer"
              className={stdin.length > 0 ? 'text-accent border-accent/40 bg-accent/10' : ''}
            >
              Input{stdin.length > 0 && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block" />}
            </GlassButton>
          )}

          <GlassButton
            variant="ghost"
            size="sm"
            onClick={handleShare}
            disabled={isSharing}
            leftIcon={<span className="material-symbols-outlined text-[16px]">share</span>}
            data-testid="btn-share"
            aria-label="Share code snippet"
          >
            {isSharing ? 'Sharing...' : 'Share'}
          </GlassButton>

          {FEATURES.SHARE_AND_EXPORT && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => setIsExportOpen(true)}
              data-testid="btn-open-export"
              leftIcon={<span className="material-symbols-outlined text-[16px]">file_download</span>}
              aria-label="Export trace and view"
            >
              Export
            </GlassButton>
          )}

          <GlassButton
            variant="ghost"
            size="sm"
            onClick={resetExecution}
            leftIcon={<span className="material-symbols-outlined text-[16px]">restart_alt</span>}
            aria-label="Reset execution"
          >
            Reset
          </GlassButton>

          <GlassButton
            variant="primary"
            size="sm"
            onClick={mode === 'compare' ? handleCompare : runCurrentCode}
            disabled={isLoading || isComparing}
            leftIcon={
              <span className={`material-symbols-outlined text-[16px] ${isLoading || isComparing ? 'animate-spin' : ''}`}>
                {isLoading || isComparing ? 'progress_activity' : 'play_arrow'}
              </span>
            }
            aria-label="Run Python code"
          >
            {isLoading ? 'Running...' : isComparing ? 'Comparing...' : mode === 'compare' ? 'Compare' : 'Run'}
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
      <div id="workspace-grid" className="flex-1 w-full px-4 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Monaco Code Editor(s) & Quiz (12 cols mobile, 5 cols desktop) */}
        <div
          className={`flex flex-col gap-4 lg:col-span-5 ${
            mobileTab !== 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Outdated Trace Notice Banner */}
          {isTraceOutdated && (
            <div
              data-testid="code-changed-notice"
              className="p-2.5 px-3 rounded-panel bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-mono shadow-panel"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-amber-400">warning</span>
                <span>Code changed — press <strong>Run</strong> to update trace</span>
              </div>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={runCurrentCode}
                disabled={isLoading}
                className="!py-0.5 !px-2.5 !text-xs !bg-amber-500/20 !border-amber-500/40 text-amber-200 hover:!bg-amber-500/30 cursor-pointer"
              >
                Run
              </GlassButton>
            </div>
          )}

          {/* Solution A Editor */}
          <div className="flex flex-col gap-1">
            {mode === 'compare' && (
              <span className="text-[11px] font-mono font-medium text-accent uppercase tracking-wider px-1">
                Solution A (Primary)
              </span>
            )}
            {FEATURES.STDIN_PANEL && (
              <StdinDrawer
                isOpen={isStdinOpen}
                onToggle={() => setIsStdinOpen(!isStdinOpen)}
              />
            )}
            <CodeEditor
              code={code}
              currentLine={step?.line || 1}
              onChange={(newCode) => setCode(newCode || '')}
              breakpoints={breakpoints}
              onToggleBreakpoint={toggleBreakpoint}
              onOpenModulesHelp={() => {
                setHelpModalTab('modules')
                setIsShortcutsOpen(true)
              }}
              height={mode === 'compare' ? '240px' : '440px'}
            />
          </div>

          {/* Solution B Editor in Compare Mode */}
          {mode === 'compare' && (
            <div className="flex flex-col gap-1" data-testid="compare-solution-b-container">
              <span className="text-[11px] font-mono font-medium text-sage uppercase tracking-wider px-1">
                Solution B (Alternative)
              </span>
              <CodeEditor
                code={codeB}
                currentLine={1}
                onChange={(newCode) => setCodeB(newCode || '')}
                height="240px"
              />
            </div>
          )}

          {/* Compare Results Summary Card */}
          {mode === 'compare' && compareResult && (
            <div
              data-testid="compare-results-card"
              className="p-3.5 rounded-panel bg-glass-raised border border-border-strong shadow-panel flex flex-col gap-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-accent uppercase tracking-wider text-[10px]">
                  Comparison Results
                </span>
                <span className="text-[11px] font-mono text-text-3">
                  {compareResult.step_counts.a < compareResult.step_counts.b
                    ? '⚡ Solution A is more efficient'
                    : compareResult.step_counts.a > compareResult.step_counts.b
                    ? '⚡ Solution B is more efficient'
                    : 'Equal step count'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-2 rounded-inner bg-panel-body border border-accent/30">
                  <span className="text-[10px] text-text-3 block">Solution A</span>
                  <span className="text-base font-bold text-accent">{compareResult.step_counts.a} steps</span>
                </div>
                <div className="p-2 rounded-inner bg-panel-body border border-sage/30">
                  <span className="text-[10px] text-text-3 block">Solution B</span>
                  <span className="text-base font-bold text-sage">{compareResult.step_counts.b} steps</span>
                </div>
              </div>

              {/* 6px Step-Count Comparison Bars */}
              <div className="space-y-1.5 my-1" data-testid="compare-progress-bars">
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] font-mono text-text-3">
                    <span>Solution A</span>
                    <span className="text-accent">{compareResult.step_counts.a} steps</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-glass-sunken overflow-hidden border border-border">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (compareResult.step_counts.a / Math.max(compareResult.step_counts.a, compareResult.step_counts.b, 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] font-mono text-text-3">
                    <span>Solution B</span>
                    <span className="text-sage">{compareResult.step_counts.b} steps</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-glass-sunken overflow-hidden border border-border">
                    <div
                      className="h-full bg-sage rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (compareResult.step_counts.b / Math.max(compareResult.step_counts.a, compareResult.step_counts.b, 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setSteps(compareResult.a.steps, compareResult.a.truncated, compareResult.a.error)}
                  className="flex-1 py-1 px-2 rounded-control bg-accent-soft border border-accent/30 text-accent text-[11px] font-mono hover:bg-accent/20 cursor-pointer"
                >
                  View Solution A Trace
                </button>
                <button
                  onClick={() => setSteps(compareResult.b.steps, compareResult.b.truncated, compareResult.b.error)}
                  className="flex-1 py-1 px-2 rounded-control bg-sage-soft border border-sage/30 text-sage text-[11px] font-mono hover:bg-sage/20 cursor-pointer"
                >
                  View Solution B Trace
                </button>
              </div>
            </div>
          )}

          {/* Truncated Notice Banner */}
          {isTruncated && (
            <div
              data-testid="truncated-notice"
              className="p-3.5 rounded-panel bg-panel-body border border-border-strong flex items-start gap-3 text-xs shadow-panel"
            >
              <span className="material-symbols-outlined text-base text-accent mt-0.5">warning</span>
              <div>
                <span className="font-medium text-text uppercase tracking-wider text-[10px] block">
                  Step Limit Reached
                </span>
                <p className="text-text-2 leading-relaxed font-mono text-[11px] mt-0.5">
                  Execution exceeded the maximum step threshold (2000 steps) and was truncated.
                </p>
              </div>
            </div>
          )}

          {/* Exception Notice Banner */}
          {step?.event === 'exception' && (
            <div
              data-testid="exception-notice"
              className="p-3.5 rounded-panel bg-error/15 border border-error/40 flex items-start gap-3 text-xs shadow-panel"
            >
              <span className="material-symbols-outlined text-base text-error mt-0.5">error</span>
              <div>
                <span className="font-medium text-error uppercase tracking-wider text-[10px] block">
                  Exception Step
                </span>
                <p className="text-text leading-relaxed font-mono text-[11px] mt-0.5">
                  {step.explanation || 'An unhandled exception occurred at this execution step.'}
                </p>
              </div>
            </div>
          )}

          {/* Explanation Banner */}
          {activeExplanation && (
            <div
              data-testid="step-explanation"
              className="p-3 rounded-panel bg-panel-body border border-border flex items-start gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-sm text-accent mt-0.5">info</span>
              <p className="text-text-2 leading-relaxed font-mono text-[11px]">
                {activeExplanation}
              </p>
            </div>
          )}

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
            code={code}
            preset={currentPreset}
            timeComplexity={currentPreset?.timeComplexity || 'Custom'}
            spaceComplexity={currentPreset?.spaceComplexity || '—'}
            currentStep={currentStep}
            totalSteps={steps.length}
          />
        </div>

        {/* Right Column: Execution State Panels (12 cols mobile, 7 cols desktop) */}
        <div
          className={`flex flex-col gap-4 lg:col-span-7 ${
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          } ${isTraceOutdated ? 'opacity-65 transition-opacity' : 'transition-opacity'}`}
        >
          {isTraceOutdated && (
            <div className="px-3 py-1.5 rounded-inner bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">history</span>
              <span>Showing previous execution trace. Press Run to trace the edited code.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Live Variables Watch */}
            <div className="md:col-span-7 h-64">
              <VariablesTable
                locals={activeFrame?.locals || {}}
                heap={step?.heap}
                heapObjects={step?.heapObjects}
                addressLabels={addressLabels}
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
            <MemoryHeap
              objects={step?.heapObjects || []}
              locals={activeFrame?.locals || {}}
              addressLabels={addressLabels}
              mutatedVariable={step?.mutatedVariable}
            />
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
          onStepOver={FEATURES.DEBUGGER_CONTROLS ? stepOver : undefined}
          onStepInto={FEATURES.DEBUGGER_CONTROLS ? stepInto : undefined}
          onStepOut={FEATURES.DEBUGGER_CONTROLS ? stepOut : undefined}
          onNextCall={FEATURES.DEBUGGER_CONTROLS ? nextCall : undefined}
          onContinue={FEATURES.DEBUGGER_CONTROLS ? continueToBreakpoint : undefined}
          onRestart={FEATURES.DEBUGGER_CONTROLS ? restart : undefined}
          breakpointStepIndices={breakpointStepIndices}
          onToggleEventLog={() => setIsEventLogOpen(true)}
          onOpenShortcuts={() => { setHelpModalTab('shortcuts'); setIsShortcutsOpen(true); }}
        />
      </div>

      {/* Event Log Drawer */}
      <EventLogDrawer
        isOpen={isEventLogOpen}
        onClose={() => setIsEventLogOpen(false)}
        steps={steps}
        currentStep={currentStep}
        onSelectStep={(idx) => {
          setCurrentStep(idx)
          setIsEventLogOpen(false)
        }}
      />

      {/* Keyboard Shortcuts & Help Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        initialTab={helpModalTab}
      />

      {/* Export Modal */}
      {FEATURES.SHARE_AND_EXPORT && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          code={code}
          steps={steps}
          currentStep={currentStep}
        />
      )}
    </div>
  )
}
