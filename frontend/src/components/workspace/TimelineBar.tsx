import React from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassButton } from '@/components/ui/GlassButton'
import { Slider } from '@/components/ui/Slider'
import { Tooltip } from '@/components/ui/Tooltip'

interface TimelineBarProps {
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  speed: number
  onPlayToggle: () => void
  onNext: () => void
  onPrev: () => void
  onReset: () => void
  onStepChange: (step: number) => void
  onSpeedChange: (speed: number) => void

  // Debugger Extensions
  onStepOver?: () => void
  onStepInto?: () => void
  onStepOut?: () => void
  onNextCall?: () => void
  onContinue?: () => void
  onRestart?: () => void
  breakpointStepIndices?: number[]
  onToggleEventLog?: () => void
  onOpenShortcuts?: () => void

  className?: string
}

const SPEEDS = [0.5, 1, 2, 4]

export const TimelineBar: React.FC<TimelineBarProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  onPlayToggle,
  onNext,
  onPrev,
  onReset,
  onStepChange,
  onSpeedChange,
  onStepOver,
  onStepInto,
  onStepOut,
  onNextCall,
  onContinue,
  onRestart,
  breakpointStepIndices = [],
  onToggleEventLog,
  onOpenShortcuts,
  className = '',
}) => {
  const isEnd = totalSteps === 0 || currentStep >= totalSteps - 1
  const isStart = totalSteps === 0 || currentStep === 0
  const isDisabled = totalSteps === 0

  return (
    <GlassPanel
      level={3}
      className={`px-4 py-2.5 rounded-panel border border-border-strong shadow-float flex flex-col gap-2.5 ${className}`}
    >
      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-between w-full">
        {/* Playback & Debugger Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {/* Restart */}
          <Tooltip content="Restart execution to Step 1">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={onRestart || onReset}
              disabled={isStart}
              className="p-1.5"
              aria-label="Restart execution"
              data-testid="btn-restart"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
            </GlassButton>
          </Tooltip>

          {/* Step Backward */}
          <Tooltip content="Step backward (← Left Arrow)">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={onPrev}
              disabled={isStart}
              className="p-1.5"
              aria-label="Step backward"
              data-testid="btn-step-prev"
            >
              <span className="material-symbols-outlined text-base">arrow_left</span>
            </GlassButton>
          </Tooltip>

          {/* Main Play / Pause */}
          <Tooltip content={isPlaying ? 'Pause (Space)' : 'Play auto replay (Space)'}>
            <GlassButton
              variant={isPlaying ? 'secondary' : 'primary'}
              size="md"
              onClick={onPlayToggle}
              disabled={isDisabled}
              className="px-3.5 py-1.5 font-medium"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              data-testid="btn-play"
              leftIcon={
                <span className="material-symbols-outlined text-base mr-1">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              }
            >
              <span>{isPlaying ? 'Pause' : isEnd ? 'Replay' : 'Play'}</span>
            </GlassButton>
          </Tooltip>

          {/* Step Forward (Step Into default) */}
          <Tooltip content="Step forward (→ Right Arrow)">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={isEnd}
              className="p-1.5"
              aria-label="Step forward"
              data-testid="btn-step-forward"
            >
              <span className="material-symbols-outlined text-base">arrow_right</span>
            </GlassButton>
          </Tooltip>

          <div className="w-px h-5 bg-border mx-0.5" />

          {/* Debugger: Step Over */}
          {onStepOver && (
            <Tooltip content="Step Over (F10) — Skip calls at current depth">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={onStepOver}
                disabled={isEnd}
                className="p-1.5 text-text-2 hover:text-accent"
                aria-label="Step Over"
                data-testid="btn-step-over"
              >
                <span className="material-symbols-outlined text-base">redo</span>
              </GlassButton>
            </Tooltip>
          )}

          {/* Debugger: Step Into */}
          {onStepInto && (
            <Tooltip content="Step Into (F11) — Step inside function call">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={onStepInto}
                disabled={isEnd}
                className="p-1.5 text-text-2 hover:text-accent"
                aria-label="Step Into"
                data-testid="btn-step-into"
              >
                <span className="material-symbols-outlined text-base">south</span>
              </GlassButton>
            </Tooltip>
          )}

          {/* Debugger: Step Out */}
          {onStepOut && (
            <Tooltip content="Step Out (Shift + F11) — Return to caller frame">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={onStepOut}
                disabled={isEnd}
                className="p-1.5 text-text-2 hover:text-accent"
                aria-label="Step Out"
                data-testid="btn-step-out"
              >
                <span className="material-symbols-outlined text-base">north_east</span>
              </GlassButton>
            </Tooltip>
          )}

          {/* Debugger: Next Call */}
          {onNextCall && (
            <Tooltip content="Next Call — Jump forward to next function invocation">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={onNextCall}
                disabled={isEnd}
                className="p-1.5 text-text-2 hover:text-sage"
                aria-label="Next Call"
                data-testid="btn-next-call"
              >
                <span className="material-symbols-outlined text-base">call_made</span>
              </GlassButton>
            </Tooltip>
          )}

          {/* Debugger: Continue */}
          {onContinue && (
            <Tooltip content="Continue (F8) — Run to next breakpoint or end">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={onContinue}
                disabled={isEnd}
                className="p-1.5 text-text-2 hover:text-accent font-mono text-xs"
                aria-label="Continue"
                data-testid="btn-continue"
              >
                <span className="material-symbols-outlined text-base">fast_forward</span>
              </GlassButton>
            </Tooltip>
          )}
        </div>

        {/* Timeline Scrubber with Breakpoint Indicators */}
        <div className="flex-1 w-full flex items-center gap-3">
          <span
            className="text-[11px] font-mono font-medium text-accent min-w-[2.5rem] text-right"
            data-testid="current-step-display"
          >
            {totalSteps === 0 ? 0 : currentStep + 1}
          </span>

          <div className="relative flex-1 flex items-center">
            <Slider
              min={0}
              max={Math.max(0, totalSteps - 1)}
              value={totalSteps === 0 ? 0 : currentStep}
              disabled={isDisabled}
              onChange={onStepChange}
              aria-label="Execution step scrubber"
              className="w-full relative z-10"
            />

            {/* Breakpoint Ticks Overlay */}
            {breakpointStepIndices.length > 0 && totalSteps > 1 && (
              <div className="absolute inset-x-0 h-2 pointer-events-none flex items-center z-0">
                {breakpointStepIndices.map((stepIdx) => {
                  const pct = Math.max(0, Math.min(100, (stepIdx / (totalSteps - 1)) * 100))
                  return (
                    <span
                      key={stepIdx}
                      data-testid="breakpoint-tick"
                      className="absolute w-1.5 h-3 -translate-x-1/2 bg-accent rounded-full opacity-80"
                      style={{ left: `${pct}%` }}
                      title={`Breakpoint at Step ${stepIdx + 1}`}
                    />
                  )
                })}
              </div>
            )}
          </div>

          <span
            className="text-[11px] font-mono text-text-3 min-w-[2.5rem]"
            data-testid="total-steps-display"
          >
            / {totalSteps}
          </span>
        </div>

        {/* Speed Controls & Modal Triggers */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Speed toggle pills */}
          <div className="flex items-center gap-1 bg-glass-sunken p-1 rounded-control border border-border">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 rounded-control text-[11px] font-mono transition-colors cursor-pointer ${
                  speed === s
                    ? 'bg-glass-raised text-accent border border-border-strong font-medium'
                    : 'text-text-3 hover:text-text'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Event Log Drawer Trigger */}
          {onToggleEventLog && (
            <Tooltip content="Open execution event log">
              <button
                type="button"
                onClick={onToggleEventLog}
                disabled={isDisabled}
                className="p-1.5 rounded-control bg-glass-sunken border border-border text-text-2 hover:text-text disabled:opacity-40 cursor-pointer"
                aria-label="Toggle event log drawer"
                data-testid="btn-open-event-log"
              >
                <span className="material-symbols-outlined text-base">list_alt</span>
              </button>
            </Tooltip>
          )}

          {/* Shortcuts Help Modal Trigger */}
          {onOpenShortcuts && (
            <Tooltip content="Keyboard shortcuts (F10, F11, Shift+F11, F8)">
              <button
                type="button"
                onClick={onOpenShortcuts}
                className="p-1.5 rounded-control bg-glass-sunken border border-border text-text-2 hover:text-text cursor-pointer"
                aria-label="View keyboard shortcuts"
                data-testid="btn-open-shortcuts"
              >
                <span className="material-symbols-outlined text-base">keyboard</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </GlassPanel>
  )
}
