import React from 'react'
import { Link } from 'react-router-dom'
import { GlassPanel, GlassButton } from '@/components/ui'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center text-center gap-8 w-full select-none">
      {/* Status Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-glass-sunken border border-error/30">
        <span className="w-1.5 h-1.5 rounded-full bg-error" />
        <span className="font-mono text-xs text-error tracking-wider uppercase font-medium">
          FATAL // EXECUTION TRACE TERMINATED
        </span>
        <span className="text-text-3 text-xs">•</span>
        <span className="font-mono text-xs text-text-3">0x00000000 DEREFERENCE</span>
      </div>

      {/* Big 404 Headline */}
      <div className="relative">
        <div className="font-serif text-8xl sm:text-9xl text-text font-normal tracking-tight">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-mono text-xs text-error bg-glass-sunken px-3 py-1 rounded-full border border-error/30 shadow-panel">
            SIGSEGV : SIGILL
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2 max-w-xl">
        <h1 className="font-serif text-2xl sm:text-3xl text-text font-normal tracking-tight">
          Traceback: Stack Frame Not Found
        </h1>
        <p className="font-sans text-sm text-text-2 leading-relaxed">
          The instruction pointer followed an unresolved symbol table reference. The requested target
          route does not inhabit the active namespace or was dereferenced to null.
        </p>
      </div>

      {/* Traceback Terminal Card */}
      <GlassPanel level={2} className="w-full text-left p-5 font-mono text-xs space-y-2.5 overflow-x-auto shadow-panel">
        <div className="flex items-center justify-between pb-2 border-b border-border text-text-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-error/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-sage/80" />
            <span className="ml-2 font-mono text-text-3">crash_traceback.py — VM Stack Dump</span>
          </div>
          <span className="font-mono text-accent uppercase text-[11px]">FRAME_0x7FFE</span>
        </div>

        <div className="text-error font-medium">Traceback (most recent call last):</div>
        <div className="pl-4 space-y-1 text-text-2">
          <div className="text-text-3">File &quot;codetrace/router.py&quot;, line 404, in resolve_route</div>
          <div className="pl-4 text-text bg-panel-body py-1 px-2 rounded border border-border">
            target_frame = heap.lookup(request.path)
          </div>
        </div>
        <div className="pl-4 space-y-1 text-text-2">
          <div className="text-text-3">File &quot;codetrace/virtual_memory.py&quot;, line 12, in lookup</div>
          <div className="pl-4 text-text bg-panel-body py-1 px-2 rounded border border-border">
            raise RouteNotFoundError(f&quot;Address &#39;&#123;request.path&#125;&#39; not in symbol table&quot;)
          </div>
        </div>

        <div className="mt-2 p-2.5 rounded-lg bg-error/10 border border-error/30 text-error flex items-center justify-between">
          <span className="font-medium">RouteNotFoundError: 0xDEADBEEF (Symbol Unbound)</span>
          <span className="font-mono uppercase text-[10px]">FATAL_UNCAUGHT</span>
        </div>
      </GlassPanel>

      {/* Action Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/workspace">
          <GlassButton
            variant="primary"
            size="md"
            leftIcon={<span className="material-symbols-outlined text-[18px]">replay</span>}
          >
            Rewind to Studio
          </GlassButton>
        </Link>
        <Link to="/examples">
          <GlassButton
            variant="secondary"
            size="md"
            leftIcon={<span className="material-symbols-outlined text-[18px]">grid_view</span>}
          >
            Algorithm Gallery
          </GlassButton>
        </Link>
      </div>
    </div>
  )
}
