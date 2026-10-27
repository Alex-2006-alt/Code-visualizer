import React, { useState } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Chip } from '@/components/ui/Chip'

interface OutputTerminalProps {
  stdout: string
  stderr?: string
  totalSteps: number
  currentStep: number
  className?: string
}

export const OutputTerminal: React.FC<OutputTerminalProps> = ({
  stdout,
  stderr,
  totalSteps,
  currentStep,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'stdout' | 'stderr' | 'stats'>('stdout')
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <GlassPanel intensity="low" className={`flex flex-col border border-border-subtle overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-container-lowest/60">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('stdout')}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
              activeTab === 'stdout'
                ? 'bg-cyan/15 text-cyan border border-cyan/30'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            STDOUT
          </button>
          <button
            onClick={() => setActiveTab('stderr')}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'stderr'
                ? 'bg-coral/15 text-coral border border-coral/30'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <span>STDERR</span>
            {stderr && <span className="w-1.5 h-1.5 rounded-full bg-coral animate-ping" />}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
              activeTab === 'stats'
                ? 'bg-violet/15 text-violet border border-violet/30'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            STATS
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-all"
          title={isCollapsed ? 'Expand terminal' : 'Collapse terminal'}
        >
          <span className="material-symbols-outlined text-sm">
            {isCollapsed ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {/* Terminal Body */}
      {!isCollapsed && (
        <div className="p-3 bg-bg-surface/90 font-mono text-xs overflow-y-auto max-h-48 min-h-[5rem] custom-scrollbar">
          {activeTab === 'stdout' && (
            <div>
              {stdout ? (
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                  {stdout}
                </pre>
              ) : (
                <span className="text-text-tertiary italic">No console output yet</span>
              )}
            </div>
          )}

          {activeTab === 'stderr' && (
            <div>
              {stderr ? (
                <pre className="text-coral whitespace-pre-wrap leading-relaxed">
                  {stderr}
                </pre>
              ) : (
                <span className="text-text-tertiary italic">No errors reported</span>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2 rounded bg-container-lowest/60 border border-border-subtle">
                <span className="text-[10px] text-text-tertiary uppercase block">Steps Executed</span>
                <span className="text-sm font-bold text-cyan">{currentStep + 1} / {totalSteps}</span>
              </div>
              <div className="p-2 rounded bg-container-lowest/60 border border-border-subtle">
                <span className="text-[10px] text-text-tertiary uppercase block">Virtual Memory</span>
                <span className="text-sm font-bold text-violet">~4.2 KB</span>
              </div>
              <div className="p-2 rounded bg-container-lowest/60 border border-border-subtle">
                <span className="text-[10px] text-text-tertiary uppercase block">Status</span>
                <Chip variant="emerald" size="sm" className="mt-0.5">Ready</Chip>
              </div>
            </div>
          )}
        </div>
      )}
    </GlassPanel>
  )
}
