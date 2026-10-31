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
    <GlassPanel level={2} className={`flex flex-col border border-border overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-glass-sunken">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('stdout')}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-control transition-colors cursor-pointer ${
              activeTab === 'stdout'
                ? 'bg-accent-soft text-accent border border-accent/30'
                : 'text-text-3 hover:text-text'
            }`}
          >
            STDOUT
          </button>
          <button
            onClick={() => setActiveTab('stderr')}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-control transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'stderr'
                ? 'bg-error/15 text-error border border-error/30'
                : 'text-text-3 hover:text-text'
            }`}
          >
            <span>STDERR</span>
            {stderr && <span className="w-1.5 h-1.5 rounded-full bg-error" />}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-control transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-glass-raised text-text border border-border-strong'
                : 'text-text-3 hover:text-text'
            }`}
          >
            STATS
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-control text-text-3 hover:text-text hover:bg-glass transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand terminal' : 'Collapse terminal'}
        >
          <span className="material-symbols-outlined text-sm">
            {isCollapsed ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {/* Terminal Body with Flat Solid Fill and $ Prompt in --accent */}
      {!isCollapsed && (
        <div data-testid="terminal-content" className="p-3 bg-panel-body font-mono text-xs overflow-y-auto max-h-48 min-h-[5rem] custom-scrollbar">
          {activeTab === 'stdout' && (
            <div>
              {stdout ? (
                <div className="flex items-start gap-2">
                  <span className="text-accent select-none font-mono shrink-0">$</span>
                  <pre className="text-text whitespace-pre-wrap leading-relaxed selection:bg-accent/20 flex-1 font-mono">
                    {stdout}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-accent select-none font-mono shrink-0">$</span>
                  <span className="text-text-2 italic">No console output yet</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stderr' && (
            <div>
              {stderr ? (
                <div className="flex items-start gap-2">
                  <span className="text-error select-none font-mono shrink-0">!</span>
                  <pre className="text-error whitespace-pre-wrap leading-relaxed selection:bg-error/20 flex-1 font-mono">
                    {stderr}
                  </pre>
                </div>
              ) : (
                <span className="text-text-2 italic">No errors reported</span>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2 rounded-inner bg-glass border border-border">
                <span className="text-[10px] text-text-3 uppercase tracking-wider font-sans block">Steps Executed</span>
                <span className="text-sm font-mono font-semibold text-accent">{currentStep + 1} / {totalSteps}</span>
              </div>
              <div className="p-2 rounded-inner bg-glass border border-border">
                <span className="text-[10px] text-text-3 uppercase tracking-wider font-sans block">Virtual Memory</span>
                <span className="text-sm font-mono font-semibold text-text">~4.2 KB</span>
              </div>
              <div className="p-2 rounded-inner bg-glass border border-border">
                <span className="text-[10px] text-text-3 uppercase tracking-wider font-sans block">Status</span>
                <Chip label="Ready" variant="secondary" active className="mt-0.5 text-[10px] py-0 px-2" />
              </div>
            </div>
          )}
        </div>
      )}
    </GlassPanel>
  )
}
