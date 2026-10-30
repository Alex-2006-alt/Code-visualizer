import React, { useRef, useEffect, useCallback } from 'react'
import Editor, { OnMount, Monaco } from '@monaco-editor/react'
import type * as monacoType from 'monaco-editor'
import { GlassPanel } from '@/components/ui'

export interface CodeEditorProps {
  code: string
  currentLine?: number
  onChange?: (val: string) => void
  readOnly?: boolean
  breakpoints?: number[]
  onToggleBreakpoint?: (line: number) => void
  height?: string
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  currentLine = 1,
  onChange,
  readOnly = false,
  breakpoints = [],
  onToggleBreakpoint,
  height = '420px',
}) => {
  const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const decorationsCollectionRef = useRef<monacoType.editor.IEditorDecorationsCollection | null>(null)

  const updateDecorations = useCallback(() => {
    if (!editorRef.current || !monacoRef.current) return
    const monaco = monacoRef.current
    const newDecorations: monacoType.editor.IModelDeltaDecoration[] = []

    // 1. Current executing line decoration with accent highlight and gutter arrow
    if (currentLine > 0) {
      newDecorations.push({
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: 'current-execution-line',
          glyphMarginClassName: 'execution-arrow-glyph',
          overviewRuler: {
            color: '#7FA8D1',
            position: monaco.editor.OverviewRulerLane.Full,
          },
        },
      })
      editorRef.current.revealLineInCenter(currentLine, monaco.editor.ScrollType.Smooth)
    }

    // 2. Armed breakpoints in gutter
    breakpoints.forEach((bpLine) => {
      newDecorations.push({
        range: new monaco.Range(bpLine, 1, bpLine, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName: 'breakpoint-glyph',
        },
      })
    })

    if (decorationsCollectionRef.current) {
      decorationsCollectionRef.current.set(newDecorations)
    }
  }, [currentLine, breakpoints])

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Define Midnight Blue & Sage editor theme
    monaco.editor.defineTheme('midnight-sage', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6F7A8A', fontStyle: 'italic' },
        { token: 'keyword', foreground: '8FC4A8' },
        { token: 'identifier', foreground: 'E8EBF0' },
        { token: 'type', foreground: '8FB9E3' },
        { token: 'function', foreground: '8FB9E3' },
        { token: 'string', foreground: 'C3D9CB' },
        { token: 'number', foreground: 'C9D6EA' },
        { token: 'delimiter', foreground: 'A5ACB8' },
        { token: 'operator', foreground: 'A5ACB8' },
      ],
      colors: {
        'editor.background': '#08090B',
        'editor.foreground': '#E8EBF0',
        'editorLineNumber.foreground': '#8791A0',
        'editorLineNumber.activeForeground': '#7FA8D1',
        'editor.selectionBackground': '#7FA8D133',
        'editor.lineHighlightBackground': '#00000000',
        'editorGutter.background': '#08090B',
        'editorCursor.foreground': '#7FA8D1',
      },
    })

    // Fallback theme registration for backward compatibility
    monaco.editor.defineTheme('codetrace-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6F7A8A', fontStyle: 'italic' },
        { token: 'keyword', foreground: '8FC4A8' },
        { token: 'identifier', foreground: 'E8EBF0' },
        { token: 'type', foreground: '8FB9E3' },
        { token: 'function', foreground: '8FB9E3' },
        { token: 'string', foreground: 'C3D9CB' },
        { token: 'number', foreground: 'C9D6EA' },
        { token: 'delimiter', foreground: 'A5ACB8' },
        { token: 'operator', foreground: 'A5ACB8' },
      ],
      colors: {
        'editor.background': '#08090B',
        'editor.foreground': '#E8EBF0',
        'editorLineNumber.foreground': '#8791A0',
        'editorLineNumber.activeForeground': '#7FA8D1',
        'editor.selectionBackground': '#7FA8D133',
        'editor.lineHighlightBackground': '#00000000',
        'editorGutter.background': '#08090B',
        'editorCursor.foreground': '#7FA8D1',
      },
    })

    monaco.editor.setTheme('midnight-sage')

    // Handle gutter click for armed breakpoints
    editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const line = e.target.position?.lineNumber
        if (line && onToggleBreakpoint) {
          onToggleBreakpoint(line)
        }
      }
    })

    decorationsCollectionRef.current = editor.createDecorationsCollection([])
    updateDecorations()

    // Expose instance for automated E2E testing
    if (typeof window !== 'undefined') {
      ;(window as unknown as { __codeEditor?: unknown }).__codeEditor = editor
    }
  }

  useEffect(() => {
    updateDecorations()
  }, [updateDecorations])

  return (
    <GlassPanel level={2} className="w-full flex flex-col overflow-hidden shadow-panel">
      {/* Editor Bar */}
      <div className="px-4 py-2.5 bg-glass-sunken border-b border-border flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-border-strong" />
          <span className="text-text font-medium tracking-tight">script.py</span>
        </div>

        <div className="flex items-center gap-3 text-text-3">
          <span className="text-accent font-mono text-[11px]" data-testid="current-line-display">
            Ln {currentLine}
          </span>
          <span className="text-border-strong">•</span>
          <span className="text-[11px] text-text-3">Python 3.12</span>
        </div>
      </div>

      {/* Monaco Container */}
      <div style={{ height }}>
        <Editor
          height="100%"
          language="python"
          value={code}
          theme="midnight-sage"
          onChange={(val) => onChange?.(val || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            lineHeight: 22,
            glyphMargin: true,
            lineNumbersMinChars: 3,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'none',
            folding: false,
            contextmenu: false,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>
    </GlassPanel>
  )
}
