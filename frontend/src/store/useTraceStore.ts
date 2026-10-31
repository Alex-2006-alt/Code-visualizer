import { create } from 'zustand'
import { TraceStep, TracePreset } from '@/types/trace'
import { PRESETS, DEFAULT_PRESET } from '@/mocks'
import { executeCode } from '@/lib/api'

export type ExecutionMode = 'visualize' | 'predict' | 'compare'

interface TraceState {
  // Core Code & Execution
  code: string
  steps: TraceStep[]
  currentStep: number
  isPlaying: boolean
  isLoading: boolean
  isTraceOutdated: boolean
  activeRequestId: string | null
  speed: number
  mode: ExecutionMode
  currentPreset: TracePreset | null
  isTruncated: boolean
  executionError: string | null

  // Predict Mode Scoring
  streak: number
  correctCount: number
  totalAnswered: number
  selectedAnswer: number | null
  answerFeedback: 'idle' | 'correct' | 'incorrect'

  // Actions
  setCode: (code: string) => void
  selectCustom: () => void
  setSteps: (steps: TraceStep[], isTruncated?: boolean, executionError?: string | null) => void
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
  runCurrentCode: () => Promise<void>

  // Predict mode actions
  submitPredictAnswer: (optionIndex: number) => boolean
  clearPredictAnswer: () => void
}

let playTimer: ReturnType<typeof setInterval> | null = null

export const useTraceStore = create<TraceState>((set, get) => ({
  code: DEFAULT_PRESET.code,
  steps: [],
  currentStep: 0,
  isPlaying: false,
  isLoading: false,
  isTraceOutdated: false,
  activeRequestId: null,
  speed: 1,
  mode: 'visualize',
  currentPreset: DEFAULT_PRESET,
  isTruncated: false,
  executionError: null,

  streak: 0,
  correctCount: 0,
  totalAnswered: 0,
  selectedAnswer: null,
  answerFeedback: 'idle',

  setCode: (code) => {
    const { currentPreset, steps } = get()
    const updates: Partial<TraceState> = { code }
    if (currentPreset && currentPreset.code !== code) {
      updates.currentPreset = null
    }
    if (steps.length > 0) {
      updates.isTraceOutdated = true
    }
    set(updates)
  },

  selectCustom: () => set({ currentPreset: null }),

  setSteps: (steps, isTruncated = false, executionError = null) =>
    set({
      steps,
      currentStep: 0,
      isPlaying: false,
      isTruncated,
      executionError,
      isTraceOutdated: false,
      selectedAnswer: null,
      answerFeedback: 'idle',
    }),

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
    if (isPlaying || steps.length === 0) return
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
      steps: [], // Clears any previous trace; never attaches a saved trace
      currentStep: 0,
      isTruncated: false,
      executionError: null,
      isTraceOutdated: false,
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

  runCurrentCode: async () => {
    const { code, pause } = get()
    pause()
    const requestId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    set({ isLoading: true, activeRequestId: requestId, executionError: null })
    try {
      const result = await executeCode(code, { requestId })

      // Ignore stale response if another execution was started
      if (get().activeRequestId !== requestId) {
        return
      }

      if (result.steps && result.steps.length > 0) {
        set({
          steps: result.steps,
          currentStep: 0,
          isTruncated: result.truncated,
          executionError: result.error,
          isTraceOutdated: false,
          selectedAnswer: null,
          answerFeedback: 'idle',
        })
      } else {
        set({
          steps: [],
          currentStep: 0,
          isTruncated: false,
          executionError: result.error || 'Execution returned no steps.',
          isTraceOutdated: false,
          selectedAnswer: null,
          answerFeedback: 'idle',
        })
      }
    } catch (err: unknown) {
      if (get().activeRequestId !== requestId) {
        return
      }
      const msg = err instanceof Error ? err.message : 'Execution failed'
      set({
        steps: [],
        currentStep: 0,
        executionError: msg,
        isTraceOutdated: false,
        selectedAnswer: null,
        answerFeedback: 'idle',
      })
    } finally {
      if (get().activeRequestId === requestId) {
        set({ isLoading: false, activeRequestId: null })
      }
    }
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

// Expose store globally for automated E2E testing
if (typeof window !== 'undefined') {
  ;(window as unknown as { useTraceStore?: typeof useTraceStore }).useTraceStore = useTraceStore
}
