import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Midnight Blue & Sage System Tokens
        bg: 'var(--bg)',
        glass: 'var(--glass)',
        'glass-raised': 'var(--glass-raised)',
        'glass-sunken': 'var(--glass-sunken)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        highlight: 'var(--highlight)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
        'text-disabled': 'var(--text-disabled)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          press: 'var(--accent-press)',
          soft: 'var(--accent-soft)',
        },
        'on-accent': 'var(--on-accent)',
        sage: {
          DEFAULT: 'var(--sage)',
          soft: 'var(--sage-soft)',
        },
        changed: {
          DEFAULT: 'var(--changed)',
          soft: 'var(--changed-soft)',
        },
        success: 'var(--success)',
        error: 'var(--error)',
        info: 'var(--info)',
        syn: {
          keyword: 'var(--syn-keyword)',
          function: 'var(--syn-function)',
          number: 'var(--syn-number)',
          string: 'var(--syn-string)',
          comment: 'var(--syn-comment)',
          operator: 'var(--syn-operator)',
        },

        // Legacy compatibility mappings during phased transition
        surface: 'var(--bg)',
        'surface-dim': 'var(--bg)',
        'surface-bright': '#171b26',
        'surface-container-lowest': '#07080c',
        'surface-container-low': '#0e1119',
        'surface-container': '#121622',
        'surface-container-high': '#1a202d',
        'surface-container-highest': '#222938',
        'surface-variant': '#222938',
        'on-surface': 'var(--text)',
        'on-surface-variant': 'var(--text-2)',
        outline: 'var(--text-3)',
        'outline-variant': 'var(--border)',
        primary: {
          DEFAULT: 'var(--accent)',
          container: 'var(--accent-hover)',
        },
        'on-primary': 'var(--on-accent)',
        secondary: {
          DEFAULT: 'var(--sage)',
          container: 'var(--sage)',
        },
        'on-secondary': '#0A121B',
        tertiary: {
          DEFAULT: 'var(--syn-number)',
          container: 'var(--accent-press)',
        },
        amber: {
          mutation: 'var(--sage)',
        },
        background: 'var(--bg)',
        'on-background': 'var(--text)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius-inner)',
        sm: '6px',
        md: '8px',
        lg: 'var(--radius-inner)',
        xl: '12px',
        '2xl': 'var(--radius-panel)',
        panel: 'var(--radius-panel)',
        inner: 'var(--radius-inner)',
        control: 'var(--radius-control)',
        full: '9999px',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
        code: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'headline-xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.025em', fontWeight: '400' }],
        'headline-lg': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-sm': ['18px', { lineHeight: '26px', letterSpacing: '-0.015em', fontWeight: '500' }],
        'body-md': ['14px', { lineHeight: '22px', letterSpacing: '-0.005em', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'code-lg': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'code-md': ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'code-sm': ['11px', { lineHeight: '16px', fontWeight: '400' }],
        'label-caps': ['11px', { lineHeight: '14px', letterSpacing: '0.08em', fontWeight: '500' }],
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
        float: 'var(--shadow-float)',
        'glass-1': 'var(--shadow-panel)',
        'glass-2': 'var(--shadow-float)',
        // Eliminate glows cleanly
        'glow-primary': 'none',
        'glow-secondary': 'none',
        'glow-cyan': 'none',
        'glow-amber': 'none',
        'glow-error': 'none',
      },
      transitionTimingFunction: {
        smooth: 'var(--ease)',
        ease: 'var(--ease)',
      },
    },
  },
  plugins: [],
}

export default config
