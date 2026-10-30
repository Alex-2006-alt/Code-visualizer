import React from 'react'
import { Link } from 'react-router-dom'

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 w-full bg-glass-sunken border-t border-border backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-text-3">
        {/* Left Telemetry */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] text-text-3">VM ENGINE: CPYTHON 3.12</span>
          <span className="text-border-strong">•</span>
          <span className="font-mono text-[11px] text-accent flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            EXECUTION TRACER ACTIVE
          </span>
        </div>

        {/* Center Links */}
        <div className="flex items-center gap-6">
          <Link to="/workspace" className="text-text-2 hover:text-text transition-colors">
            Workspace
          </Link>
          <Link to="/examples" className="text-text-2 hover:text-text transition-colors">
            Examples
          </Link>
          <a
            href="https://github.com/Alex-2006-alt/Code-visualizer"
            target="_blank"
            rel="noreferrer"
            className="text-text-2 hover:text-text transition-colors"
          >
            GitHub
          </a>
        </div>

        {/* Right Copyright */}
        <div className="font-mono text-[11px] text-text-3">
          © {new Date().getFullYear()} CodeTrace • Python Visualizer
        </div>
      </div>
    </footer>
  )
}
