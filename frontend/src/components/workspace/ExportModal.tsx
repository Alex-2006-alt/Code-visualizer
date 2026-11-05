import React from 'react'
import { Modal, GlassButton } from '@/components/ui'
import { TraceStep } from '@/types/trace'
import {
  downloadTraceJson,
  copyStepMarkdown,
  exportViewAsPng,
} from '@/lib/exportUtils'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  code: string
  steps: TraceStep[]
  currentStep: number
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  code,
  steps,
  currentStep,
}) => {
  const currentStepData = steps[currentStep] || steps[0]
  const hasRecordedTrace = steps && steps.length > 0

  const handleDownloadJson = () => {
    downloadTraceJson(code, steps, currentStep)
    onClose()
  }

  const handleCopyMarkdown = async () => {
    if (currentStepData) {
      await copyStepMarkdown(currentStepData, currentStep, steps.length)
      onClose()
    }
  }

  const handleExportPng = async () => {
    await exportViewAsPng('workspace-grid')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Trace & View"
      size="md"
    >
      <div className="flex flex-col gap-4 font-sans text-xs" data-testid="export-modal">
        <p className="text-text-2 leading-relaxed">
          Export execution data from the current CodeTrace session for documentation, offline analysis, or bug reports.
        </p>

        <div className="divide-y divide-border border border-border rounded-panel overflow-hidden bg-panel-body">
          {/* 1. Download JSON Trace */}
          <button
            onClick={handleDownloadJson}
            disabled={!hasRecordedTrace}
            data-testid="btn-download-json"
            className="w-full p-3.5 flex items-start gap-3.5 text-left hover:bg-glass transition-colors disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            <div className="p-2 rounded bg-glass border border-border text-accent group-hover:border-accent/40 shrink-0">
              <span className="material-symbols-outlined text-[20px]">data_object</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-text text-xs flex items-center gap-1.5">
                Download JSON Trace
                {hasRecordedTrace && (
                  <span className="text-[10px] font-mono text-sage">({steps.length} steps)</span>
                )}
              </span>
              <span className="text-[11px] text-text-3 leading-relaxed">
                Complete execution trace matching the OpenAPI TraceStepSchema with call stack, variables, and virtual heap objects.
              </span>
            </div>
          </button>

          {/* 2. Copy Step as Markdown */}
          <button
            onClick={handleCopyMarkdown}
            disabled={!hasRecordedTrace}
            data-testid="btn-copy-step-markdown"
            className="w-full p-3.5 flex items-start gap-3.5 text-left hover:bg-glass transition-colors disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            <div className="p-2 rounded bg-glass border border-border text-sage group-hover:border-sage/40 shrink-0">
              <span className="material-symbols-outlined text-[20px]">content_paste</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-text text-xs flex items-center gap-1.5">
                Copy Step #{currentStep + 1} as Markdown
              </span>
              <span className="text-[11px] text-text-3 leading-relaxed">
                Formatted GitHub Flavored Markdown table of active variables, current source line, and call stack frames.
              </span>
            </div>
          </button>

          {/* 3. Export View as PNG */}
          <button
            onClick={handleExportPng}
            data-testid="btn-export-view-png"
            className="w-full p-3.5 flex items-start gap-3.5 text-left hover:bg-glass transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded bg-glass border border-border text-text-2 group-hover:border-accent/40 shrink-0">
              <span className="material-symbols-outlined text-[20px]">image</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-text text-xs">
                Export View as PNG
              </span>
              <span className="text-[11px] text-text-3 leading-relaxed">
                Capture the current visual state of the workspace panels as a PNG image.
              </span>
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-1">
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={onClose}
            data-testid="btn-close-export-modal"
          >
            Close
          </GlassButton>
        </div>
      </div>
    </Modal>
  )
}
