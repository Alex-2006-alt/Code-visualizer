import React, { useState, useMemo, useEffect } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { TracePreset, ComplexityResult } from '@/types/trace'
import { fetchComplexityAnalysis } from '@/lib/api'

interface ComplexityMeterProps {
  code?: string
  preset?: TracePreset | null
  timeComplexity?: string
  spaceComplexity?: string
  currentStep: number
  totalSteps: number
  className?: string
}

interface DetectedFunction {
  name: string
  params: string[]
}

export const ComplexityMeter: React.FC<ComplexityMeterProps> = ({
  code = '',
  preset = null,
  timeComplexity,
  spaceComplexity,
  currentStep,
  totalSteps,
  className = '',
}) => {
  // 1. Detect functions in code via regex
  const detectedFunctions = useMemo<DetectedFunction[]>(() => {
    if (!code) return []
    const fns: DetectedFunction[] = []
    const fnRegex = /(?:^|\n)\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g
    let match: RegExpExecArray | null
    while ((match = fnRegex.exec(code)) !== null) {
      const name = match[1]
      const rawParams = match[2]
        .split(',')
        .map((p) => p.trim().split(':')[0].trim())
        .filter(Boolean)
      fns.push({ name, params: rawParams })
    }
    return fns
  }, [code])

  const [selectedFunction, setSelectedFunction] = useState<string>('')
  const [inputKind, setInputKind] = useState<
    'int_list' | 'sorted_int_list' | 'reversed_int_list' | 'string' | 'int_n' | 'int_list_and_target'
  >('int_list')
  const [analysisCase, setAnalysisCase] = useState<'best' | 'average' | 'worst'>('average')
  const [metric, setMetric] = useState<'time' | 'space'>('time')

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [analysisResult, setAnalysisResult] = useState<ComplexityResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Update selected function when detected functions change
  useEffect(() => {
    if (detectedFunctions.length > 0) {
      if (!detectedFunctions.some((f) => f.name === selectedFunction)) {
        const first = detectedFunctions[0]
        setSelectedFunction(first.name)
        // Set smart default inputKind
        if (first.params.length === 2) {
          setInputKind('int_list_and_target')
        } else if (
          first.params.length === 1 &&
          ['n', 'num', 'size', 'count'].includes(first.params[0].toLowerCase())
        ) {
          setInputKind('int_n')
        } else {
          setInputKind('int_list')
        }
      }
    } else {
      setSelectedFunction('')
    }
  }, [detectedFunctions, selectedFunction])

  // Clear analysis result when code changes significantly
  useEffect(() => {
    setAnalysisResult(null)
    setAnalysisError(null)
  }, [code])

  const handleAnalyze = async () => {
    if (!selectedFunction || !code) return
    setIsAnalyzing(true)
    setAnalysisError(null)
    try {
      const result = await fetchComplexityAnalysis({
        code,
        function_name: selectedFunction,
        input_kind: inputKind,
        case: analysisCase,
      })
      setAnalysisResult(result)
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Display labels
  const effectiveTimeLabel =
    analysisResult?.time_label ?? preset?.timeComplexity ?? timeComplexity ?? '—'
  const effectiveSpaceLabel =
    analysisResult?.space_label ?? preset?.spaceComplexity ?? spaceComplexity ?? '—'
  const isEstimated = Boolean(analysisResult)
  const isPresetKnown = !analysisResult && Boolean(preset?.timeComplexity)

  // Format explanation text
  const plainExplanation = useMemo(() => {
    if (!analysisResult || analysisResult.points.length < 2) return null
    const p0 = analysisResult.points[0]
    const pLast = analysisResult.points[analysisResult.points.length - 1]
    const nRatio = (pLast.n / (p0.n || 1)).toFixed(1)
    const stepRatio = (pLast.steps / (p0.steps || 1)).toFixed(1)
    return `At n=${p0.n}: ${p0.steps} steps. At n=${pLast.n}: ${pLast.steps} steps (~${stepRatio}x for ${nRatio}x input, matching ${analysisResult.time_label}).`
  }, [analysisResult])

  return (
    <GlassPanel
      level={2}
      className={`flex flex-col p-3 border border-border overflow-hidden bg-glass-sunken ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-accent">speed</span>
          <span className="text-[11px] font-sans font-medium uppercase tracking-[0.08em] text-text-3">
            Complexity
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-glass border border-border text-text font-mono text-[10px]">
            <span>T: {effectiveTimeLabel}</span>
            {isEstimated && (
              <span className="text-[9px] text-accent font-sans px-1 rounded bg-accent/15 border border-accent/25">
                Estimated
              </span>
            )}
            {isPresetKnown && (
              <span className="text-[9px] text-text-3 font-sans px-1 rounded bg-panel-body border border-border">
                Known
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-glass border border-border text-text font-mono text-[10px]">
            <span>S: {effectiveSpaceLabel}</span>
            {isEstimated && (
              <span className="text-[9px] text-accent font-sans px-1 rounded bg-accent/15 border border-accent/25">
                Estimated
              </span>
            )}
            {isPresetKnown && (
              <span className="text-[9px] text-text-3 font-sans px-1 rounded bg-panel-body border border-border">
                Known
              </span>
            )}
          </div>

          {analysisResult && (
            <span
              title={`Tested across ${analysisResult.points.length} sizes from ${analysisResult.points[0]?.n} to ${analysisResult.points[analysisResult.points.length - 1]?.n}`}
              className={`px-2 py-0.5 rounded-full border text-[9px] font-sans cursor-help ${
                analysisResult.confidence === 'high'
                  ? 'text-accent border-accent/30 bg-accent/10'
                  : analysisResult.confidence === 'medium'
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    : 'text-text-3 border-border bg-glass'
              }`}
            >
              {analysisResult.confidence.toUpperCase()} CONFIDENCE
            </span>
          )}
        </div>
      </div>

      {/* Controls & Configuration */}
      {detectedFunctions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 mb-2 pt-1 pb-2 border-b border-border/50 text-[10px]">
          {/* Function Selector */}
          <div className="flex items-center gap-1">
            <span className="text-text-3">Function:</span>
            <select
              value={selectedFunction}
              onChange={(e) => setSelectedFunction(e.target.value)}
              className="bg-panel-body border border-border text-text px-1.5 py-0.5 rounded text-[10px] font-mono focus:outline-none focus:border-accent"
            >
              {detectedFunctions.map((fn) => (
                <option key={fn.name} value={fn.name}>
                  {fn.name}()
                </option>
              ))}
            </select>
          </div>

          {/* Input Type */}
          <div className="flex items-center gap-1">
            <span className="text-text-3">Input:</span>
            <select
              value={inputKind}
              onChange={(e) => setInputKind(e.target.value as any)}
              className="bg-panel-body border border-border text-text px-1.5 py-0.5 rounded text-[10px] font-mono focus:outline-none focus:border-accent"
            >
              <option value="int_list">Integer List</option>
              <option value="sorted_int_list">Sorted List</option>
              <option value="reversed_int_list">Reversed List</option>
              <option value="int_list_and_target">List + Target</option>
              <option value="int_n">Integer n</option>
              <option value="string">String</option>
            </select>
          </div>

          {/* Case */}
          <div className="flex items-center gap-1">
            <span className="text-text-3">Case:</span>
            <select
              value={analysisCase}
              onChange={(e) => setAnalysisCase(e.target.value as any)}
              className="bg-panel-body border border-border text-text px-1.5 py-0.5 rounded text-[10px] font-mono focus:outline-none focus:border-accent"
            >
              <option value="average">Average</option>
              <option value="best">Best</option>
              <option value="worst">Worst</option>
            </select>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedFunction}
            className="ml-auto px-2.5 py-0.5 rounded bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 font-sans font-medium text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <span className="material-symbols-outlined text-xs animate-spin">refresh</span>
                <span>Measuring...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xs">analytics</span>
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="px-2.5 py-1.5 mb-2 rounded bg-panel-body border border-border/50 text-[11px] text-text-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-xs text-text-3">info</span>
          <span>Wrap your code in a function to measure its Big-O complexity.</span>
        </div>
      )}

      {/* Metric Toggle if results exist */}
      {analysisResult && (
        <div className="flex items-center justify-between mb-1.5 text-[10px]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMetric('time')}
              className={`px-2 py-0.5 rounded text-[9px] font-mono transition-colors ${
                metric === 'time'
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-text-3 hover:text-text'
              }`}
            >
              Time (Steps vs n)
            </button>
            <button
              onClick={() => setMetric('space')}
              className={`px-2 py-0.5 rounded text-[9px] font-mono transition-colors ${
                metric === 'space'
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-text-3 hover:text-text'
              }`}
            >
              Space (Aux / Depth vs n)
            </button>
          </div>
          <span className="text-text-3 text-[9px] font-mono">
            {analysisResult.points.length} measurements
          </span>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-28 w-full p-1 rounded-inner bg-panel-body border border-border/40 flex flex-col justify-center">
        {analysisResult && analysisResult.points.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analysisResult.points.map((p) => ({
                n: p.n,
                value: metric === 'time' ? p.steps : Math.max(p.peak_items, p.depth),
              }))}
              margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="n" stroke="#6F7A8A" fontSize={9} tickLine={false} />
              <YAxis stroke="#6F7A8A" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#08090B',
                  borderColor: 'rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  fontSize: '10px',
                  color: '#E8EBF0',
                }}
                formatter={(val: any) => [val, metric === 'time' ? 'Steps' : 'Space proxy']}
                labelFormatter={(label: any) => `Input size n = ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8FC4A8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#8FC4A8' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-2 text-text-3">
            <span className="material-symbols-outlined text-lg mb-1 opacity-50">ssid_chart</span>
            <span className="text-[10px]">
              {detectedFunctions.length > 0
                ? 'Click Analyze to measure actual Big-O curve for this function'
                : 'Define a Python function and click Run'}
            </span>
          </div>
        )}
      </div>

      {/* Notes / AST hints / Explanation */}
      {analysisResult && (
        <div className="mt-2 space-y-1">
          {plainExplanation && (
            <p className="text-[10px] text-text-2 font-mono">{plainExplanation}</p>
          )}
          {analysisResult.notes.map((note, idx) => (
            <div
              key={idx}
              className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-xs">info</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      )}

      {analysisError && (
        <div className="mt-2 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">warning</span>
          <span>{analysisError}</span>
        </div>
      )}

      {/* Footer: real trace steps, no fake Step Overhead */}
      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono">
        <span className="text-text-3">Steps in this run:</span>
        <span className="text-accent font-medium">
          {totalSteps > 0 ? (
            <span>
              {totalSteps} steps (at #{currentStep + 1})
            </span>
          ) : (
            '0'
          )}
        </span>
      </div>
    </GlassPanel>
  )
}
