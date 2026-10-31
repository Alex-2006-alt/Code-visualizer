import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { GlassPanel } from '@/components/ui/GlassPanel'

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
    <GlassPanel level={2} className={`flex flex-col p-3 border border-border overflow-hidden bg-glass-sunken ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-accent">speed</span>
          <span className="text-[11px] font-sans font-medium uppercase tracking-[0.08em] text-text-3">
            Complexity
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Neutral glass chips with mono text, no colored fill */}
          <span className="px-2 py-0.5 rounded-full bg-glass border border-border text-text font-mono text-[10px]">
            T: {timeComplexity}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-glass border border-border text-text font-mono text-[10px]">
            S: {spaceComplexity}
          </span>
        </div>
      </div>

      {/* Progress & Big-O Chart on Flat Solid Surface */}
      <div className="h-24 w-full mt-1 p-1 rounded-inner bg-panel-body border border-border/40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={COMPLEXITY_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="n" stroke="#6F7A8A" fontSize={9} tickLine={false} />
            <YAxis stroke="#6F7A8A" fontSize={9} tickLine={false} domain={[0, 70]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#08090B',
                borderColor: 'rgba(255,255,255,0.12)',
                borderRadius: '8px',
                fontSize: '10px',
                color: '#E8EBF0',
              }}
            />
            <Line
              type="monotone"
              dataKey="O(1)"
              stroke="#7FA8D1"
              strokeWidth={timeComplexity === 'O(1)' ? 2.5 : 1}
              dot={false}
              opacity={timeComplexity === 'O(1)' ? 1 : 0.3}
            />
            <Line
              type="monotone"
              dataKey="O(n)"
              stroke="#8FC4A8"
              strokeWidth={timeComplexity === 'O(n)' ? 2.5 : 1}
              dot={false}
              opacity={timeComplexity === 'O(n)' ? 1 : 0.3}
            />
            <Line
              type="monotone"
              dataKey="O(n^2)"
              stroke="#C9D6EA"
              strokeWidth={timeComplexity === 'O(n^2)' ? 2.5 : 1}
              dot={false}
              opacity={timeComplexity === 'O(n^2)' ? 1 : 0.3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Execution Step Progress Bar */}
      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono">
        <span className="text-text-3">Step Overhead:</span>
        <span className="text-accent font-medium">
          {Math.round(((currentStep + 1) / totalSteps) * 100)}%
        </span>
      </div>
    </GlassPanel>
  )
}
