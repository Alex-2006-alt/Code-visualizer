import React from 'react'
import { GlassPanel, GlassButton } from '@/components/ui'
import { useTraceStore } from '@/store/useTraceStore'

interface StdinDrawerProps {
  isOpen: boolean
  onToggle: () => void
}

const MAX_STDIN_BYTES = 10240

export const StdinDrawer: React.FC<StdinDrawerProps> = ({ isOpen, onToggle }) => {
  const { stdin, setStdin, clearStdin } = useTraceStore()

  const byteLength = new Blob([stdin]).size
  const isOverLimit = byteLength > MAX_STDIN_BYTES
  const lineCount = stdin ? stdin.split('\n').length : 0

  const handleInsertSample = (sample: string) => {
    setStdin(sample)
  }

  return (
    <GlassPanel
      level={2}
      className={`w-full overflow-hidden transition-all duration-300 shadow-panel border border-border ${
        isOpen ? 'max-h-[320px] opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0 border-transparent pointer-events-none'
      }`}
      data-testid="stdin-panel"
    >
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-glass-sunken border-b border-border flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-accent">input</span>
          <span className="text-text font-medium tracking-tight">Standard Input (stdin)</span>
          {stdin.length > 0 && (
            <span
              data-testid="stdin-line-count-badge"
              className="px-2 py-0.5 rounded-full bg-accent-soft text-accent text-[10px] font-mono border border-accent/30"
            >
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            data-testid="stdin-byte-counter"
            className={`text-[11px] font-mono ${isOverLimit ? 'text-error font-bold' : 'text-text-3'}`}
          >
            {byteLength} / {MAX_STDIN_BYTES} B
          </span>

          {stdin.length > 0 && (
            <button
              onClick={clearStdin}
              data-testid="btn-clear-stdin"
              className="px-2 py-0.5 rounded text-[11px] font-mono text-text-3 hover:text-error hover:bg-error/10 transition-colors"
              title="Clear stdin buffer"
            >
              Clear
            </button>
          )}

          <button
            onClick={onToggle}
            data-testid="btn-close-stdin-panel"
            className="p-1 rounded text-text-3 hover:text-text transition-colors"
            aria-label="Collapse input panel"
          >
            <span className="material-symbols-outlined text-[16px]">expand_less</span>
          </button>
        </div>
      </div>

      {/* Textarea buffer */}
      <div className="p-3 bg-panel-body flex flex-col gap-2.5">
        <textarea
          data-testid="stdin-textarea"
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="Enter lines for input() or sys.stdin.read()...&#10;Line 1&#10;Line 2&#10;Line 3"
          rows={4}
          className="w-full p-2.5 rounded-inner bg-glass-sunken border border-border text-text font-mono text-xs focus:outline-none focus:border-accent resize-none placeholder:text-text-3/60 leading-relaxed"
          spellCheck={false}
        />

        {/* Quick sample presets & instructions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
          <div className="flex items-center gap-1.5 text-text-3 font-mono">
            <span className="text-[10px] uppercase tracking-wider text-text-3">Presets:</span>
            <button
              onClick={() => handleInsertSample('Alice\n25\nSoftware Engineer\n')}
              data-testid="btn-sample-user-profile"
              className="px-2 py-0.5 rounded bg-glass border border-border hover:border-accent/40 text-text-2 hover:text-accent transition-colors"
            >
              User Profile
            </button>
            <button
              onClick={() => handleInsertSample('10 20 30 40 50\n')}
              data-testid="btn-sample-integers"
              className="px-2 py-0.5 rounded bg-glass border border-border hover:border-accent/40 text-text-2 hover:text-accent transition-colors"
            >
              Numbers
            </button>
            <button
              onClick={() => handleInsertSample('apple,banana,orange,grape\n')}
              data-testid="btn-sample-csv"
              className="px-2 py-0.5 rounded bg-glass border border-border hover:border-accent/40 text-text-2 hover:text-accent transition-colors"
            >
              CSV List
            </button>
          </div>

          <span className="text-[11px] text-text-3 font-mono hidden sm:inline">
            Fed sequentially into <code className="text-sage">input()</code>
          </span>
        </div>
      </div>
    </GlassPanel>
  )
}
