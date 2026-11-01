import React from 'react'
import { Modal, GlassButton } from '@/components/ui'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutItem {
  keys: string[]
  action: string
  description: string
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ['F10'],
    action: 'Step Over',
    description: 'Advance execution while staying in the current function scope (steps over calls).',
  },
  {
    keys: ['F11'],
    action: 'Step Into',
    description: 'Advance to the very next step, stepping inside function calls.',
  },
  {
    keys: ['Shift', 'F11'],
    action: 'Step Out',
    description: 'Advance execution until the current function returns to its caller.',
  },
  {
    keys: ['F8'],
    action: 'Continue',
    description: 'Run forward until the next armed breakpoint or the end of the trace.',
  },
  {
    keys: ['Space'],
    action: 'Play / Pause',
    description: 'Toggle auto-replay loop at the currently selected playback speed.',
  },
  {
    keys: ['←'],
    action: 'Step Backward',
    description: 'Go to the previous recorded step in the execution trace.',
  },
  {
    keys: ['→'],
    action: 'Step Forward',
    description: 'Go to the next recorded step in the execution trace.',
  },
  {
    keys: ['Click Gutter'],
    action: 'Toggle Breakpoint',
    description: 'Click next to any line number in the code editor to arm or disarm a breakpoint.',
  },
]

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <div className="flex flex-col gap-4 font-sans text-xs" data-testid="shortcuts-modal">
        <p className="text-text-2 leading-relaxed">
          CodeTrace provides debugger-style keyboard navigation designed for rapid algorithm stepping.
        </p>

        <div className="divide-y divide-border border border-border rounded-panel overflow-hidden bg-panel-body">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="p-3 flex items-center justify-between gap-4 hover:bg-glass transition-colors"
            >
              <div className="flex flex-col gap-0.5 text-left">
                <span className="font-medium text-text">{item.action}</span>
                <span className="text-[11px] text-text-3 leading-relaxed">{item.description}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0 font-mono">
                {item.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2 py-1 rounded bg-glass-sunken border border-border-strong text-accent text-[11px] shadow-sm font-semibold"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <GlassButton variant="secondary" size="sm" onClick={onClose} data-testid="btn-close-shortcuts">
            Got it
          </GlassButton>
        </div>
      </div>
    </Modal>
  )
}

