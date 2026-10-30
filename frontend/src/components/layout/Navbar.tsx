import React, { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { GlassButton } from '@/components/ui'
import { cn } from '@/lib/utils'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Clean Navigation: 2 top links only (Workspace & Examples)
  const navLinks = [
    { to: '/workspace', label: 'Workspace' },
    { to: '/examples', label: 'Examples' },
  ]

  const isLinkActive = (to: string) => {
    return location.pathname.startsWith(to)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full h-16 bg-bg/85 backdrop-blur-xl border-b border-border shadow-panel">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand identity: Instrument Serif Display */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-control bg-glass border border-border flex items-center justify-center text-accent group-hover:border-accent/40 transition-colors">
            <span className="material-symbols-outlined text-[18px]">terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl tracking-tight text-text font-normal">
              Code<span className="text-accent italic">Trace</span>
            </span>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-glass border border-border text-[10px] font-mono text-text-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Py 3.12</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links with 2px accent underline */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isLinkActive(link.to)
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  'relative px-4 py-2 font-sans text-xs transition-colors duration-150',
                  active
                    ? 'text-text font-medium'
                    : 'text-text-2 hover:text-text hover:bg-glass rounded-control'
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent" />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Right CTA / Actions */}
        <div className="flex items-center gap-2.5">
          <Link to="/workspace">
            <GlassButton
              variant="primary"
              size="sm"
              leftIcon={<span className="material-symbols-outlined text-[16px]">play_arrow</span>}
            >
              Open Studio
            </GlassButton>
          </Link>

          <a
            href="https://github.com/Alex-2006-alt/Code-visualizer"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            className="w-8 h-8 rounded-control flex items-center justify-center bg-glass border border-border hover:border-border-strong text-text-3 hover:text-text transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">code</span>
          </a>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 rounded-control text-text-3 hover:text-text hover:bg-glass"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-glass-sunken backdrop-blur-xl px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'px-4 py-2 rounded-control text-xs font-sans transition-colors',
                isLinkActive(link.to)
                  ? 'bg-glass-raised text-accent font-medium border border-border-strong'
                  : 'text-text-2 hover:text-text hover:bg-glass'
              )}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
