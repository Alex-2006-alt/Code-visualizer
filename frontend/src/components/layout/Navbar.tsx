import React, { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { GlassButton } from '@/components/ui'
import { cn } from '@/lib/utils'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/workspace', label: 'Workspace' },
    { to: '/examples', label: 'Examples' },
    { to: '/workspace?mode=predict', label: 'Predict Mode' },
    { to: '/workspace?mode=compare', label: 'Compare Mode' },
  ]

  const isLinkActive = (to: string) => {
    if (to.includes('?')) {
      return location.pathname + location.search === to
    }
    return location.pathname === to && !location.search
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full h-16 bg-surface/75 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-white/10 flex items-center justify-center shadow-[0_0_12px_rgba(202,190,255,0.25)] group-hover:border-primary/50 transition-colors">
            <span className="material-symbols-outlined text-secondary text-[20px]">terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-lg font-bold tracking-tight text-white">
              Code<span className="text-primary">Trace</span>
            </span>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high/80 border border-secondary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_#5de6ff] animate-pulse" />
              <span className="font-code-sm text-[10px] text-secondary uppercase font-semibold">
                Py 3.12
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center p-1 rounded-full bg-surface-container-low/70 border border-white/[0.08] backdrop-blur-xl">
          {navLinks.map((link) => {
            const active = isLinkActive(link.to)
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  'px-3.5 py-1.5 rounded-full font-body-sm text-xs transition-all duration-150',
                  active
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(148,125,255,0.35)]'
                    : 'text-on-surface-variant hover:text-white hover:bg-surface-container-high'
                )}
              >
                {link.label}
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
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high/60 border border-white/10 hover:bg-surface-container-highest text-on-surface-variant hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">code</span>
          </a>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-surface-container-lowest/95 backdrop-blur-2xl px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isLinkActive(link.to)
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface-container'
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
