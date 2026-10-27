import { create } from 'zustand'
import { TraceStep, TracePreset } from '@/types/trace'
import { PRESETS, DEFAULT_PRESET } from '@/mocks'

export type ExecutionMode = 'visualize' | 'predict' | 'compare'

interface TraceState {
  // Core Code & Execution
  code: string
  steps: TraceStep[]
  currentStep: number
  isPlaying: boolean
  speed: number
  mode: ExecutionMode
  currentPreset: TracePreset

  // Predict Mode Scoring
  streak: number
  correctCount: number
  totalAnswered: number
  selectedAnswer: number | null
  answerFeedback: 'idle' | 'correct' | 'incorrect'

  // Actions
  setCode: (code: string) => void
  setSteps: (steps: TraceStep[]) => void
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  setSpeed: (speed: number) => void
  setMode: (mode: ExecutionMode) => void
  loadPreset: (presetId: string) => void
  resetExecution: () => void

  // Predict mode actions
  submitPredictAnswer: (optionIndex: number) => boolean
  clearPredictAnswer: () => void
}

let playTimer: ReturnType<typeof setInterval> | null = null

export const useTraceStore = create<TraceState>((set, get) => ({
  code: DEFAULT_PRESET.code,
  steps: DEFAULT_PRESET.steps,
  currentStep: 0,
  isPlaying: false,
  speed: 1,
  mode: 'visualize',
  currentPreset: DEFAULT_PRESET,

  streak: 0,
  correctCount: 0,
  totalAnswered: 0,
  selectedAnswer: null,
  answerFeedback: 'idle',

  setCode: (code) => set({ code }),
  setSteps: (steps) => set({ steps, currentStep: 0, isPlaying: false }),
  setCurrentStep: (step) => {
    const { steps } = get()
    const target = Math.max(0, Math.min(steps.length - 1, step))
    set({ currentStep: target, selectedAnswer: null, answerFeedback: 'idle' })
  },

  nextStep: () => {
    const { currentStep, steps, isPlaying, pause } = get()
    if (currentStep < steps.length - 1) {
      set({ currentStep: currentStep + 1, selectedAnswer: null, answerFeedback: 'idle' })
    } else if (isPlaying) {
      pause()
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1, selectedAnswer: null, answerFeedback: 'idle' })
    }
  },

  play: () => {
    const { isPlaying, currentStep, steps, speed, nextStep } = get()
    if (isPlaying) return
    if (currentStep >= steps.length - 1) {
      set({ currentStep: 0 })
    }
    set({ isPlaying: true })

    if (playTimer) clearInterval(playTimer)
    playTimer = setInterval(() => {
      nextStep()
    }, 1000 / speed)
  },

  pause: () => {
    if (playTimer) {
      clearInterval(playTimer)
      playTimer = null
    }
    set({ isPlaying: false })
  },

  togglePlay: () => {
    const { isPlaying, play, pause } = get()
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  },

  setSpeed: (speed) => {
    set({ speed })
    const { isPlaying, pause, play } = get()
    if (isPlaying) {
      pause()
      play()
    }
  },

  setMode: (mode) => set({ mode }),

  loadPreset: (presetId) => {
    const preset = PRESETS[presetId] || DEFAULT_PRESET
    get().pause()
    set({
      currentPreset: preset,
      code: preset.code,
      steps: preset.steps,
      currentStep: 0,
      selectedAnswer: null,
      answerFeedback: 'idle',
    })
  },

  resetExecution: () => {
    get().pause()
    set({
      currentStep: 0,
      selectedAnswer: null,
      answerFeedback: 'idle',
    })
  },

  submitPredictAnswer: (optionIndex) => {
    const { steps, currentStep, streak, correctCount, totalAnswered } = get()
    const step = steps[currentStep]
    if (!step?.predict) return false

    const isCorrect = optionIndex === step.predict.correctIndex
    set({
      selectedAnswer: optionIndex,
      answerFeedback: isCorrect ? 'correct' : 'incorrect',
      streak: isCorrect ? streak + 1 : 0,
      correctCount: isCorrect ? correctCount + 1 : correctCount,
      totalAnswered: totalAnswered + 1,
    })
    return isCorrect
  },

  clearPredictAnswer: () => set({ selectedAnswer: null, answerFeedback: 'idle' }),
}))
