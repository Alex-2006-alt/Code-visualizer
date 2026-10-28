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

    // 1. Current executing line decoration with cyan glow and gutter arrow
    if (currentLine > 0) {
      newDecorations.push({
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: 'current-execution-line',
          glyphMarginClassName: 'execution-arrow-glyph',
          overviewRuler: {
            color: '#22d3ee',
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

    // Define custom Obsidian Trace theme
    monaco.editor.defineTheme('codetrace-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'cabeff', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'dfe2f2' },
        { token: 'string', foreground: 'a2eeff' },
        { token: 'number', foreground: 'f8acff' },
        { token: 'delimiter', foreground: '938ea1' },
      ],
      colors: {
        'editor.background': '#0a0e19',
        'editor.foreground': '#dfe2f2',
        'editorLineNumber.foreground': '#484555',
        'editorLineNumber.activeForeground': '#5de6ff',
        'editor.selectionBackground': '#947dff33',
        'editor.lineHighlightBackground': '#171b2766',
        'editorGutter.background': '#0a0e19',
      },
    })
    monaco.editor.setTheme('codetrace-dark')

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
  }

  useEffect(() => {
    updateDecorations()
  }, [updateDecorations])

  return (
    <GlassPanel level={2} className="w-full flex flex-col overflow-hidden shadow-2xl">
      {/* Editor Bar */}
      <div className="px-4 py-2 bg-surface-container-high/60 border-b border-white/5 flex items-center justify-between text-xs font-code-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-white font-medium">script.py</span>
        </div>

        <div className="flex items-center gap-3 text-outline">
          <span className="text-secondary font-mono text-[11px]">Ln {currentLine}</span>
          <span className="text-white/20">•</span>
          <span className="text-[11px]">Python 3.12</span>
        </div>
      </div>

      {/* Monaco Container */}
      <div style={{ height }}>
        <Editor
          height="100%"
          language="python"
          value={code}
          theme="codetrace-dark"
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
