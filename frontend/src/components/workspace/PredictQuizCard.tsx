import React from 'react'
import { motion } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassButton } from '@/components/ui/GlassButton'
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
      <GlassPanel level={2} className={`p-4 text-center text-text-2 bg-glass-sunken border border-border ${className}`}>
        <span className="material-symbols-outlined text-2xl mb-1 text-text-3">psychology</span>
        <p className="text-xs">No active prediction for this step. Step forward to test your recall!</p>
      </GlassPanel>
    )
  }

  return (
    <GlassPanel level={2} className={`p-4 border border-border overflow-hidden bg-glass-sunken ${className}`}>
      {/* Header with Streak */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-accent">psychology</span>
          <h4 className="text-[11px] font-sans font-medium uppercase tracking-[0.08em] text-text-3">
            Predict Mode
          </h4>
        </div>
        {streak > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-accent-soft border border-accent/30 text-accent font-mono text-[10px]">
            🔥 {streak} Streak
          </span>
        )}
      </div>

      {/* Question Prompt */}
      <p className="text-xs font-sans font-medium text-text mb-3.5 leading-relaxed">
        {question.prompt}
      </p>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {question.options.map((opt, idx) => {
          const isSelected = selectedAnswer === idx
          const isCorrect = idx === question.correctIndex
          const showResult = feedback !== 'idle'

          let style = 'bg-glass border-border text-text hover:border-border-strong'
          if (showResult) {
            if (isCorrect) {
              style = 'bg-sage-soft border-sage/60 text-sage font-medium'
            } else if (isSelected) {
              style = 'bg-error/15 border-error/50 text-error font-medium'
            } else {
              style = 'opacity-40 bg-glass border-border text-text-3'
            }
          }

          return (
            <button
              key={idx}
              disabled={showResult}
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left px-3 py-2 rounded-control border text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${style}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-3">[{String.fromCharCode(65 + idx)}]</span>
                <span>{opt}</span>
              </div>
              {showResult && isCorrect && (
                <span className="material-symbols-outlined text-sm text-sage">check_circle</span>
              )}
              {showResult && isSelected && !isCorrect && (
                <span className="material-symbols-outlined text-sm text-error">cancel</span>
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
          className="mt-3 p-2.5 rounded-control bg-panel-body border border-border text-xs"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`font-medium ${feedback === 'correct' ? 'text-sage' : 'text-error'}`}>
              {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          <p className="text-[11px] text-text-2 leading-relaxed mb-2">
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
