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
  className = '',
}) => {
  const isEnd = currentStep >= totalSteps - 1
  const isStart = currentStep === 0

  return (
    <GlassPanel
      level={2}
      className={`px-4 py-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl ${className}`}
    >
      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
        {/* Playback action controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Tooltip content="Reset to start">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={isStart}
              className="p-2"
              aria-label="Reset execution"
            >
              <span className="material-symbols-outlined text-sm">skip_previous</span>
            </GlassButton>
          </Tooltip>

          <Tooltip content="Step backward (Left Arrow)">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={onPrev}
              disabled={isStart}
              className="p-2"
              aria-label="Step backward"
            >
              <span className="material-symbols-outlined text-base">arrow_left</span>
            </GlassButton>
          </Tooltip>

          <Tooltip content={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
            <GlassButton
              variant={isPlaying ? 'secondary' : 'primary'}
              size="md"
              onClick={onPlayToggle}
              className="px-4 py-2 font-bold"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <span className="material-symbols-outlined text-lg mr-1">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
              <span>{isPlaying ? 'Pause' : isEnd ? 'Replay' : 'Play'}</span>
            </GlassButton>
          </Tooltip>

          <Tooltip content="Step forward (Right Arrow)">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={isEnd}
              className="p-2"
              aria-label="Step forward"
            >
              <span className="material-symbols-outlined text-base">arrow_right</span>
            </GlassButton>
          </Tooltip>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex-1 w-full flex items-center gap-3">
          <span className="text-[11px] font-mono font-medium text-cyan min-w-[2.5rem] text-right">
            {currentStep + 1}
          </span>
          <Slider
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStep}
            onChange={onStepChange}
            aria-label="Execution step scrubber"
            className="flex-1"
          />
          <span className="text-[11px] font-mono text-text-tertiary min-w-[2.5rem]">
            / {totalSteps}
          </span>
        </div>

        {/* Speed toggle pills */}
        <div className="flex items-center gap-1 shrink-0 bg-container-lowest/50 p-1 rounded-xl border border-border-subtle">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                speed === s
                  ? 'bg-cyan/20 text-cyan border border-cyan/40 shadow-[0_0_8px_rgba(93,230,255,0.3)]'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </GlassPanel>
  )
}
