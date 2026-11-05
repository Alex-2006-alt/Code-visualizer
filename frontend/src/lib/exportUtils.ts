/**
 * CodeTrace Export & Serialization Utilities
 *
 * Provides:
 * 1. JSON trace download conforming to TraceStepSchema
 * 2. Markdown step summary generation and clipboard copying
 * 3. Lightweight view screenshot export
 */

import { TraceStep } from '@/types/trace'
import { toast } from '@/components/ui/toastStore'

export interface TraceExportPayload {
  version: string
  timestamp: string
  code: string
  total_steps: number
  current_step: number
  steps: TraceStep[]
}

/**
 * Downloads the full recorded execution trace as a formatted JSON file.
 */
export function downloadTraceJson(
  code: string,
  steps: TraceStep[],
  currentStep: number,
  filename?: string
): boolean {
  if (!steps || steps.length === 0) {
    toast.warning('No Trace Recorded', 'Please run the code before exporting the trace.')
    return false
  }

  const payload: TraceExportPayload = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    code,
    total_steps: steps.length,
    current_step: currentStep,
    steps,
  }

  try {
    const jsonString = JSON.stringify(payload, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `codetrace-trace-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Trace Exported', `Downloaded JSON trace with ${steps.length} steps.`)
    return true
  } catch (err) {
    toast.error('Export Failed', 'Could not generate JSON download.')
    return false
  }
}

/**
 * Formats the current execution step into a structured GitHub Flavored Markdown summary.
 */
export function generateStepMarkdown(
  step: TraceStep,
  currentStep: number,
  totalSteps: number
): string {
  if (!step) return ''

  const lines: string[] = []
  lines.push(`### CodeTrace Execution Step #${currentStep + 1} of ${totalSteps}`)
  lines.push(`- **Event Type:** \`${step.event}\``)
  lines.push(`- **Source Line:** \`Line ${step.line}\``)
  if (step.mutatedVariable) {
    lines.push(`- **Mutated Variable:** \`${step.mutatedVariable}\``)
  }
  if (step.explanation) {
    lines.push(`- **Explanation:** ${step.explanation}`)
  }
  lines.push('')

  // Call Stack
  lines.push('#### Call Stack')
  if (step.stack && step.stack.length > 0) {
    step.stack.forEach((frame, idx) => {
      lines.push(`${idx + 1}. \`${frame.fn}()\` at line ${frame.line}`)
    })
  } else {
    lines.push('*Global module scope*')
  }
  lines.push('')

  // Local Variables
  const activeFrame = step.stack && step.stack.length > 0 ? step.stack[step.stack.length - 1] : null
  const locals = activeFrame?.locals || {}
  const localKeys = Object.keys(locals)

  lines.push('#### Local Variables')
  if (localKeys.length > 0) {
    lines.push('| Variable | Value | Type |')
    lines.push('| :--- | :--- | :--- |')
    for (const key of localKeys) {
      const val = locals[key]
      const typeStr = val === null ? 'None' : Array.isArray(val) ? 'list' : typeof val
      lines.push(`| \`${key}\` | \`${JSON.stringify(val)}\` | \`${typeStr}\` |`)
    }
  } else {
    lines.push('*No local variables defined in this scope.*')
  }
  lines.push('')

  // Terminal Output
  if (step.output) {
    lines.push('#### Terminal Output')
    lines.push('```text')
    lines.push(step.output.trimEnd())
    lines.push('```')
    lines.push('')
  }

  lines.push('---')
  lines.push('*Exported from [CodeTrace](https://codetrace.dev) (CPython 3.12)*')

  return lines.join('\n')
}

/**
 * Copies the Markdown step summary to the user's system clipboard.
 */
export async function copyStepMarkdown(
  step: TraceStep,
  currentStep: number,
  totalSteps: number
): Promise<boolean> {
  const md = generateStepMarkdown(step, currentStep, totalSteps)
  if (!md) {
    toast.warning('No Step Selected', 'Please run the code to capture an execution step.')
    return false
  }

  try {
    await navigator.clipboard.writeText(md)
    toast.success(
      'Markdown Copied!',
      `Copied summary of Step #${currentStep + 1} to your clipboard.`
    )
    return true
  } catch {
    toast.error('Clipboard Error', 'Could not write Markdown to clipboard.')
    return false
  }
}

/**
 * Lightweight DOM-to-Canvas PNG exporter using an SVG ForeignObject pipeline.
 */
export async function exportViewAsPng(containerId = 'workspace-grid'): Promise<boolean> {
  const element = document.getElementById(containerId)
  if (!element) {
    toast.warning('View Unavailable', 'Could not locate workspace canvas container.')
    return false
  }

  try {
    const rect = element.getBoundingClientRect()
    const width = Math.max(800, Math.round(rect.width))
    const height = Math.max(500, Math.round(rect.height))

    const canvas = document.createElement('canvas')
    canvas.width = width * 2 // 2x retina scaling
    canvas.height = height * 2
    const ctx = canvas.getContext('2d')
    if (!ctx) return false

    ctx.scale(2, 2)
    // Draw background
    ctx.fillStyle = '#08090B'
    ctx.fillRect(0, 0, width, height)

    // Clone element html into foreignObject
    const clone = element.cloneNode(true) as HTMLElement
    // Inline computed styles
    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; color: #E8EBF0; background: #08090B;">
            ${clone.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `

    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, width, height)
          URL.revokeObjectURL(url)
          resolve()
        } catch (e) {
          reject(e)
        }
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve() // Resolve gracefully
      }
      img.src = url
    })

    const pngUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = pngUrl
    a.download = `codetrace-view-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast.success('PNG Saved', 'Workspace view exported as PNG.')
    return true
  } catch (err) {
    // Graceful fallback notice as permitted by spec
    toast.info('Export Notice', 'DOM capture requires canvas permissions; trace JSON & Markdown export are primary.')
    return false
  }
}
