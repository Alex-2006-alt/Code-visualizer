import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Chip } from '@/components/ui/Chip'

interface ComplexityMeterProps {
  timeComplexity: string
  spaceComplexity: string
  currentStep: number
  totalSteps: number
  className?: string
}

const COMPLEXITY_DATA = [
  { n: 1, 'O(1)': 1, 'O(n)': 1, 'O(n^2)': 1 },
  { n: 2, 'O(1)': 1, 'O(n)': 2, 'O(n^2)': 4 },
  { n: 4, 'O(1)': 1, 'O(n)': 4, 'O(n^2)': 16 },
  { n: 6, 'O(1)': 1, 'O(n)': 6, 'O(n^2)': 36 },
  { n: 8, 'O(1)': 1, 'O(n)': 8, 'O(n^2)': 64 },
]

export const ComplexityMeter: React.FC<ComplexityMeterProps> = ({
  timeComplexity,
  spaceComplexity,
  currentStep,
  totalSteps,
  className = '',
}) => {
  return (
    <GlassPanel intensity="low" className={`flex flex-col p-3 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-amber-400">speed</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Complexity
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Chip variant="cyan" size="sm" className="font-mono text-[9px]">
            T: {timeComplexity}
          </Chip>
          <Chip variant="violet" size="sm" className="font-mono text-[9px]">
            S: {spaceComplexity}
          </Chip>
        </div>
      </div>

      {/* Progress & Big-O Chart */}
      <div className="h-24 w-full mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={COMPLEXITY_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <XAxis dataKey="n" stroke="#525866" fontSize={9} tickLine={false} />
            <YAxis stroke="#525866" fontSize={9} tickLine={false} domain={[0, 70]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0E19',
                borderColor: '#262A36',
                borderRadius: '8px',
                fontSize: '10px',
              }}
            />
            <Line
              type="monotone"
              dataKey="O(1)"
              stroke="#5DE6FF"
              strokeWidth={timeComplexity === 'O(1)' ? 3 : 1}
              dot={false}
              opacity={timeComplexity === 'O(1)' ? 1 : 0.3}
            />
            <Line
              type="monotone"
              dataKey="O(n)"
              stroke="#CABEFF"
              strokeWidth={timeComplexity === 'O(n)' ? 3 : 1}
              dot={false}
              opacity={timeComplexity === 'O(n)' ? 1 : 0.3}
            />
            <Line
              type="monotone"
              dataKey="O(n^2)"
              stroke="#FBBF24"
              strokeWidth={timeComplexity === 'O(n^2)' ? 3 : 1}
              dot={false}
              opacity={timeComplexity === 'O(n^2)' ? 1 : 0.3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Execution Step Progress Bar */}
      <div className="mt-2 pt-2 border-t border-border-subtle flex items-center justify-between text-[10px] font-mono">
        <span className="text-text-tertiary">Step Overhead:</span>
        <span className="text-cyan font-bold">
          {Math.round(((currentStep + 1) / totalSteps) * 100)}%
        </span>
      </div>
    </GlassPanel>
  )
}
