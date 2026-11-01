import React from 'react'
import { GlassPanel } from '@/components/ui'

export const SandboxSecuritySection: React.FC = () => {
  const securityFeatures = [
    {
      icon: 'wifi_off',
      title: 'Zero Network Access',
      description:
        'Sandboxes run with all network interfaces disabled. Your code cannot make external HTTP requests, open sockets, or exfiltrate data.',
    },
    {
      icon: 'lock',
      title: 'No Filesystem Access',
      description:
        'The execution environment has a read-only root filesystem. Local file creation and OS operations like open() or subprocess are prohibited.',
    },
    {
      icon: 'timer',
      title: '5s Timeout & 2,000 Steps',
      description:
        'A hard 5-second wall-clock limit and a 2,000-step execution cap protect system responsiveness and halt infinite loops automatically.',
    },
    {
      icon: 'memory',
      title: '128 MB RAM & 64 PIDs',
      description:
        'Each execution is constrained to 128 MB of memory and a 64-process thread limit, eliminating risk of memory exhaustion or fork bombs.',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-10">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-2.5 max-w-2xl mx-auto">
        <span className="font-sans text-xs uppercase tracking-[0.08em] text-sage font-medium">
          Sandbox Architecture
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text tracking-tight">
          Isolated, sandboxed, and secure.
        </h2>
        <p className="font-sans text-sm sm:text-base text-text-2 leading-relaxed">
          Arbitrary Python code execution requires rigorous isolation. Every run is constrained by multi-layered defensive guardrails.
        </p>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {securityFeatures.map((feat) => (
          <GlassPanel
            key={feat.title}
            level={1}
            className="p-6 sm:p-7 rounded-panel border border-border shadow-panel flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-control bg-glass-sunken border border-border text-accent flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">{feat.icon}</span>
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <h3 className="font-serif text-xl sm:text-2xl text-text font-normal">
                {feat.title}
              </h3>
              <p className="font-sans text-sm text-text-2 leading-relaxed">
                {feat.description}
              </p>
            </div>
          </GlassPanel>
        ))}
      </div>
    </section>
  )
}
