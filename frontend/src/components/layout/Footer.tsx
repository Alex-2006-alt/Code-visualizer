import React from 'react'
import { Link } from 'react-router-dom'

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 w-full bg-surface-container-lowest/80 border-t border-white/[0.08] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-body-sm text-on-surface-variant">
        {/* Left Telemetry */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-code-sm text-outline">VM ENGINE: CPYTHON 3.12.2</span>
          <span className="text-outline-variant">•</span>
          <span className="font-code-sm text-secondary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            BYTECODE DISASSEMBLY ACTIVE
          </span>
        </div>

        {/* Center Links */}
        <div className="flex items-center gap-6">
          <Link to="/workspace" className="hover:text-white transition-colors">
            Workspace
          </Link>
          <Link to="/examples" className="hover:text-white transition-colors">
            Algorithm Gallery
          </Link>
          <Link to="/workspace?mode=predict" className="hover:text-white transition-colors">
            Predict Mode
          </Link>
          <a
            href="https://github.com/Alex-2006-alt/Code-visualizer"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>

        {/* Right Copyright */}
        <div className="font-code-sm text-outline">
          © {new Date().getFullYear()} CodeTrace Studio • Real-Time Execution Engine
        </div>
      </div>
    </footer>
  )
}
