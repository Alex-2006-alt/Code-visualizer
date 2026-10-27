import React from 'react'
import { motion } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassButton } from '@/components/ui/GlassButton'
import { Chip } from '@/components/ui/Chip'
import { PredictQuestion } from '@/types/trace'

interface PredictQuizCardProps {
  question?: PredictQuestion
  selectedAnswer: number | null
  feedback: 'idle' | 'correct' | 'incorrect'
  streak: number
  onSelectOption: (index: number) => void
  onNextStep?: () => void
  className?: string
}

export const PredictQuizCard: React.FC<PredictQuizCardProps> = ({
  question,
  selectedAnswer,
  feedback,
  streak,
  onSelectOption,
  onNextStep,
  className = '',
}) => {
  if (!question) {
    return (
      <GlassPanel level={1} className={`p-4 text-center text-text-tertiary ${className}`}>
        <span className="material-symbols-outlined text-2xl mb-1 opacity-40">psychology</span>
        <p className="text-xs">No active prediction for this step. Step forward to test your recall!</p>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel level={2} glow="primary" className={`p-4 border border-violet/30 overflow-hidden ${className}`}>
      {/* Header with Streak */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-violet">psychology</span>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Predict Mode
          </h4>
        </div>
        {streak > 0 && (
          <Chip
            label={`🔥 ${streak} Streak`}
            variant="tertiary"
            active
            className="font-mono text-[10px] py-0.5 px-2"
          />
        )}
      </div>

      {/* Question Prompt */}
      <p className="text-xs font-medium text-text-primary mb-3.5 leading-relaxed">
        {question.prompt}
      </p>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {question.options.map((opt, idx) => {
          const isSelected = selectedAnswer === idx
          const isCorrect = idx === question.correctIndex
          const showResult = feedback !== 'idle'

          let style = 'bg-bg-surface/70 border-border-subtle text-text-secondary hover:border-violet/40 hover:text-text-primary'
          if (showResult) {
            if (isCorrect) {
              style = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            } else if (isSelected) {
              style = 'bg-coral/20 border-coral/60 text-coral font-semibold'
            } else {
              style = 'opacity-40 bg-bg-surface/30 border-border-subtle text-text-tertiary'
            }
          }

          return (
            <button
              key={idx}
              disabled={showResult}
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${style}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-60">[{String.fromCharCode(65 + idx)}]</span>
                <span>{opt}</span>
              </div>
              {showResult && isCorrect && (
                <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
              )}
              {showResult && isSelected && !isCorrect && (
                <span className="material-symbols-outlined text-sm text-coral">cancel</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Feedback & Explanation */}
      {feedback !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2.5 rounded-lg bg-container-lowest/80 border border-border-subtle text-xs"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`font-semibold ${feedback === 'correct' ? 'text-emerald-400' : 'text-coral'}`}>
              {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          <p className="text-[11px] text-text-tertiary leading-relaxed mb-2">
            {question.explanation}
          </p>
          {onNextStep && (
            <GlassButton variant="primary" size="sm" onClick={onNextStep} className="w-full">
              <span>Next Step</span>
              <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </GlassButton>
          )}
        </motion.div>
      )}
    </GlassPanel>
  )
}
