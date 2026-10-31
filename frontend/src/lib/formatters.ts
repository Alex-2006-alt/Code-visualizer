import { TraceStep, HeapObject, Frame } from '@/types/trace'

export interface FormattedValue {
  preview: string
  badge: { label: string; dotClass: string }
  refLabel?: string
  fullAddress?: string
  refAddress?: string
  isRef?: boolean
}

/**
 * Builds a stable map of object addresses to friendly labels (@1, @2, @3) in order of appearance.
 * The same object keeps the exact same label across the entire execution replay.
 */
export function buildAddressLabelMap(steps: TraceStep[]): Map<string, string> {
  const addressToLabel = new Map<string, string>()
  let counter = 1

  for (const step of steps) {
    // Scan heapObjects in step
    if (step.heapObjects) {
      for (const obj of step.heapObjects) {
        if (obj.address) {
          const lower = obj.address.toLowerCase()
          if (!addressToLabel.has(lower)) {
            addressToLabel.set(lower, `@${counter}`)
            counter++
          }
        }
      }
    }

    // Scan heap keys
    if (step.heap) {
      for (const addr of Object.keys(step.heap)) {
        const lower = addr.toLowerCase()
        if (!addressToLabel.has(lower)) {
          addressToLabel.set(lower, `@${counter}`)
          counter++
        }
      }
    }

    // Scan stack frame locals
    if (step.stack) {
      for (const frame of step.stack) {
        if (frame.locals) {
          for (const val of Object.values(frame.locals)) {
            if (typeof val === 'string') {
              const match = val.match(/0x[0-9a-fA-F]+/i)
              if (match) {
                const lower = match[0].toLowerCase()
                if (!addressToLabel.has(lower)) {
                  addressToLabel.set(lower, `@${counter}`)
                  counter++
                }
              }
            }
          }
        }
      }
    }
  }

  return addressToLabel
}

/**
 * Formats a single item inside a container preview in Python syntax.
 */
export function formatCompactItem(val: unknown): string {
  if (val === null || val === undefined) return 'None'
  if (typeof val === 'boolean') return val ? 'True' : 'False'
  if (typeof val === 'number') return String(val)
  if (typeof val === 'string') {
    if (val.startsWith('0x')) return val
    return `'${val}'`
  }
  if (Array.isArray(val)) {
    const items = val.slice(0, 3).map(formatCompactItem).join(', ')
    return `[${items}${val.length > 3 ? ', ...' : ''}]`
  }
  if (typeof val === 'object') {
    return '{...}'
  }
  return String(val)
}

/**
 * Formats any variable value for the Variables Panel with Python wording and compact container previews.
 */
export function formatVariableValue(
  val: unknown,
  heap?: Record<string, unknown>,
  heapObjects?: HeapObject[],
  addressLabels?: Map<string, string>
): FormattedValue {
  // 1. None / undefined
  if (val === null || val === undefined) {
    return {
      preview: 'None',
      badge: { label: 'none', dotClass: 'bg-text-3' },
    }
  }

  // 2. Boolean
  if (typeof val === 'boolean') {
    return {
      preview: val ? 'True' : 'False',
      badge: { label: 'bool', dotClass: 'bg-syn-number' },
    }
  }

  // 3. Number (int / float)
  if (typeof val === 'number') {
    return {
      preview: String(val),
      badge: {
        label: Number.isInteger(val) ? 'int' : 'float',
        dotClass: 'bg-syn-number',
      },
    }
  }

  // 4. String (inspect if function, class, or reference address)
  if (typeof val === 'string') {
    // Function formatted by tracer: "function two_sum(nums, target)"
    if (val.startsWith('function ')) {
      return {
        preview: val,
        badge: { label: 'func', dotClass: 'bg-syn-function' },
      }
    }

    // Class formatted by tracer: "class MyClass"
    if (val.startsWith('class ')) {
      return {
        preview: val,
        badge: { label: 'class', dotClass: 'bg-syn-keyword' },
      }
    }

    // Hex address pointer (e.g. 0x2990653f40 or ref -> 0x2990653f40)
    const addrMatch = val.match(/^(?:ref\s*->\s*)?(0x[0-9a-fA-F]+)$/i)
    if (addrMatch) {
      const fullAddress = addrMatch[1]
      const lower = fullAddress.toLowerCase()
      const refLabel = addressLabels?.get(lower) || `@${fullAddress.slice(-3)}`

      // Resolve from heapObjects list first
      const heapObj = heapObjects?.find((o) => o.address.toLowerCase() === lower)
      const rawHeapVal = heap ? heap[fullAddress] || heap[lower] : undefined

      if (heapObj) {
        // List container
        if (heapObj.type === 'list' && Array.isArray(heapObj.value)) {
          const items = heapObj.value
          const preview =
            items.length === 0
              ? '[]'
              : `[${items.slice(0, 6).map(formatCompactItem).join(', ')}${items.length > 6 ? ', ...' : ''}]`
          return {
            preview,
            badge: { label: 'list', dotClass: 'bg-syn-function' },
            refLabel,
            fullAddress,
            refAddress: fullAddress,
            isRef: true,
          }
        }

        // Dict container
        if (heapObj.type === 'dict' && typeof heapObj.value === 'object' && heapObj.value !== null && !Array.isArray(heapObj.value)) {
          const entries = Object.entries(heapObj.value as Record<string, unknown>)
          const preview =
            entries.length === 0
              ? '{}'
              : `{${entries.slice(0, 4).map(([k, v]) => `'${k}': ${formatCompactItem(v)}`).join(', ')}${entries.length > 4 ? ', ...' : ''}}`
          return {
            preview,
            badge: { label: 'dict', dotClass: 'bg-syn-string' },
            refLabel,
            fullAddress,
            refAddress: fullAddress,
            isRef: true,
          }
        }

        // Set container
        if (heapObj.type === 'set' && Array.isArray(heapObj.value)) {
          const items = heapObj.value
          const preview =
            items.length === 0
              ? 'set()'
              : `{${items.slice(0, 6).map(formatCompactItem).join(', ')}${items.length > 6 ? ', ...' : ''}}`
          return {
            preview,
            badge: { label: 'set', dotClass: 'bg-syn-number' },
            refLabel,
            fullAddress,
            refAddress: fullAddress,
            isRef: true,
          }
        }

        // Class instance container
        if (heapObj.type === 'instance' || (typeof heapObj.value === 'object' && (heapObj.value as any)?.__class__)) {
          const className =
            heapObj.className ||
            (heapObj.value as any)?.__class__ ||
            'Object'
          const rawFields =
            (heapObj.value as any)?.fields ||
            (typeof heapObj.value === 'object' && heapObj.value !== null && !Array.isArray(heapObj.value)
              ? heapObj.value
              : {})
          const fieldEntries = Object.entries(rawFields).filter(([k]) => !k.startsWith('__'))
          const preview =
            fieldEntries.length === 0
              ? `${className}()`
              : `${className}(${fieldEntries.slice(0, 3).map(([k, v]) => `${k}=${formatCompactItem(v)}`).join(', ')}${fieldEntries.length > 3 ? ', ...' : ''})`
          return {
            preview,
            badge: { label: 'instance', dotClass: 'bg-accent' },
            refLabel,
            fullAddress,
            refAddress: fullAddress,
            isRef: true,
          }
        }
      }

      // Fallback if resolved from rawHeapVal
      if (rawHeapVal !== undefined) {
        if (Array.isArray(rawHeapVal)) {
          const preview =
            rawHeapVal.length === 0
              ? '[]'
              : `[${rawHeapVal.slice(0, 6).map(formatCompactItem).join(', ')}${rawHeapVal.length > 6 ? ', ...' : ''}]`
          return {
            preview,
            badge: { label: 'list', dotClass: 'bg-syn-function' },
            refLabel,
            fullAddress,
            refAddress: fullAddress,
            isRef: true,
          }
        }
        if (typeof rawHeapVal === 'object' && rawHeapVal !== null) {
          const entries = Object.entries(rawHeapVal)
          const preview =
            entries.length === 0
              ? '{}'
              : `{${entries.slice(0, 4).map(([k, v]) => `'${k}': ${formatCompactItem(v)}`).join(', ')}${entries.length > 4 ? ', ...' : ''}}`
          return {
            preview,
            badge: { label: 'dict', dotClass: 'bg-syn-string' },
            refLabel,
            fullAddress,
            refAddress: fullAddress,
            isRef: true,
          }
        }
      }

      // If address not yet allocated or pruned
      return {
        preview: val,
        badge: { label: 'ref', dotClass: 'bg-accent' },
        refLabel,
        fullAddress,
        refAddress: fullAddress,
        isRef: true,
      }
    }

    // Regular primitive string with quotes
    return {
      preview: `"${val}"`,
      badge: { label: 'str', dotClass: 'bg-syn-string' },
    }
  }

  // 5. Tuple (or array in locals)
  if (Array.isArray(val)) {
    const preview =
      val.length === 0
        ? '()'
        : `(${val.slice(0, 6).map(formatCompactItem).join(', ')}${val.length > 6 ? ', ...' : ''})`
    return {
      preview,
      badge: { label: 'tuple', dotClass: 'bg-syn-function' },
    }
  }

  // 6. Generic object fallback
  if (typeof val === 'object') {
    try {
      return {
        preview: JSON.stringify(val),
        badge: { label: 'dict', dotClass: 'bg-syn-string' },
      }
    } catch {
      return {
        preview: String(val),
        badge: { label: 'object', dotClass: 'bg-text-3' },
      }
    }
  }

  return {
    preview: String(val),
    badge: { label: typeof val, dotClass: 'bg-text-3' },
  }
}

/**
 * Generates an accurate, human-readable step explanation from real execution data and source line.
 */
export function generateStepExplanation(
  step: TraceStep | undefined,
  code: string,
  activeFrame?: Frame | null,
  heap?: Record<string, unknown>,
  heapObjects?: HeapObject[],
  isOutdated: boolean = false
): string | null {
  if (!step || isOutdated) return null
  if (step.event === 'exception') return null // Exception notice banner handles this

  const lines = code.split('\n')
  const rawLine = lines[step.line - 1] || ''
  const lineCode = rawLine.trim()

  // 1. Calls print(...) and outputs ...
  if (lineCode.includes('print(') || lineCode.startsWith('print ')) {
    if (step.output && step.output.trim()) {
      const outputLines = step.output.trim().split('\n')
      const latestOutput = outputLines[outputLines.length - 1] || ''
      return `Line ${step.line}: calls print(...) and outputs ${latestOutput}`
    }
    return `Line ${step.line}: calls print(...)`
  }

  // 2. Return statements
  if (step.event === 'return') {
    let retFormatted = 'None'
    if (step.ret !== null && step.ret !== undefined) {
      if (typeof step.ret === 'boolean') {
        retFormatted = step.ret ? 'True' : 'False'
      } else if (typeof step.ret === 'string') {
        retFormatted = `'${step.ret}'`
      } else if (typeof step.ret === 'number') {
        retFormatted = String(step.ret)
      } else if (Array.isArray(step.ret)) {
        retFormatted = `[${step.ret.map(formatCompactItem).join(', ')}]`
      } else {
        try {
          retFormatted = JSON.stringify(step.ret)
        } catch {
          retFormatted = String(step.ret)
        }
      }
    }
    return `Line ${step.line}: returns ${retFormatted}`
  }

  // 3. Variable assignment / mutation
  if (step.mutatedVariable) {
    const rawVal = activeFrame?.locals?.[step.mutatedVariable]
    const formatted = formatVariableValue(rawVal, heap, heapObjects).preview
    if (lineCode.includes('=')) {
      return `Line ${step.line}: assigns ${formatted} to ${step.mutatedVariable}`
    }
    return `Line ${step.line}: ${step.mutatedVariable} updated to ${formatted}`
  }

  // 4. Function call
  if (step.event === 'call') {
    const fnName = activeFrame?.fn && activeFrame.fn !== '<module>' ? activeFrame.fn : 'function'
    return `Line ${step.line}: calls ${fnName}(...)`
  }

  // 5. Line execution default
  if (lineCode) {
    return `Line ${step.line}: executes \`${lineCode}\``
  }

  if (step.line && step.line > 0) {
    return `Line ${step.line}: executes statement`
  }

  return null
}
