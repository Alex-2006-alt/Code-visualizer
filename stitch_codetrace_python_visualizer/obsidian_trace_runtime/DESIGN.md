---
name: Obsidian Trace Runtime
colors:
  surface: '#0f131e'
  surface-dim: '#0f131e'
  surface-bright: '#353945'
  surface-container-lowest: '#0a0e19'
  surface-container-low: '#171b27'
  surface-container: '#1b1f2b'
  surface-container-high: '#262a36'
  surface-container-highest: '#313441'
  on-surface: '#dfe2f2'
  on-surface-variant: '#c9c4d8'
  inverse-surface: '#dfe2f2'
  inverse-on-surface: '#2c303c'
  outline: '#938ea1'
  outline-variant: '#484555'
  surface-tint: '#cabeff'
  primary: '#cabeff'
  on-primary: '#31009a'
  primary-container: '#947dff'
  on-primary-container: '#2a0088'
  inverse-primary: '#603ce2'
  secondary: '#5de6ff'
  on-secondary: '#00363e'
  secondary-container: '#00cbe6'
  on-secondary-container: '#00515d'
  tertiary: '#f8acff'
  on-tertiary: '#570067'
  tertiary-container: '#d164e2'
  on-tertiary-container: '#4c005a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#cabeff'
  on-primary-fixed: '#1c0062'
  on-primary-fixed-variant: '#4816cb'
  secondary-fixed: '#a2eeff'
  secondary-fixed-dim: '#2fd9f4'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#ffd6ff'
  tertiary-fixed-dim: '#f8acff'
  on-tertiary-fixed: '#350040'
  on-tertiary-fixed-variant: '#7b0190'
  background: '#0f131e'
  on-background: '#dfe2f2'
  surface-variant: '#313441'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.015em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system delivers a high-precision, focused execution environment tailored for computer science students mastering algorithmic mechanics under pressure. The aesthetic fuses the minimalist craft of Linear with Vercel's sharp edge-lit dark mode, layered under optical glassmorphism.

The visual tone is analytical, luminous, and quiet:
- **Atmosphere:** Deep vacuum backgrounds punctuated by reactive, soft-glow semantic indicators that bring the Python virtual machine to life.
- **Focus:** Distraction-free spatial separation where chrome steps back, elevating code syntax, pointers, and memory allocations into physical, glowing artifacts.
- **Emotional Resonance:** Technical confidence, clarity, and mastery over hidden execution mechanics.

## Colors
The color architecture rests on deep dark matter tones layered with specialized transmission values and high-visibility state accents:

- **Canvas & Base Surfaces:**
  - Base Stage: `#0B0F1A` (Deep Space Navy)
  - Sunken / Underlay Substrate: `#070A12` (Obsidian Base)
- **Glass Transparency Layers:**
  - Standard Glass Surface: `rgba(255, 255, 255, 0.06)` with border `rgba(255, 255, 255, 0.12)`
  - Elevated Glass (Floating docks, modals, active timeline): `rgba(255, 255, 255, 0.10)` with border `rgba(255, 255, 255, 0.20)`
  - Code & Data Contrast Glass (High legibility backing): `rgba(11, 15, 26, 0.65)` with border `rgba(255, 255, 255, 0.08)`
- **Runtime Semantic Accents:**
  - Active Step & Primary Interactive: `#7C5CFF` (Electric Violet)
  - Current Pointer / Executing Line: `#22D3EE` (Vivid Cyan)
  - Mutated Variable / Memory Write: `#FBBF24` (Amber)
  - Call Stack Return / Success: `#34D399` (Emerald)
  - Exception / Active Breakpoint: `#F87171` (Coral Red)
  - Accent Pulse: `#E879F9` (Magenta glow)
- **Text Layers:**
  - High Contrast Primary: `#F1F5F9`
  - Descriptive Secondary: `#94A3B8`
  - Structural / Muted: `#64748B`

## Typography
The system employs a strict dual-typeface discipline:

- **Inter** handles high-level spatial coordination, problem prompts, navigational telemetry, and narrative documentation. Tight tracking applies to all headline variants.
- **JetBrains Mono** governs the runtime core: active script lines, memory addresses, step counters, variable mutations, and call stack parameters. It provides reliable column alignment and unambiguous character distinction between `0` / `O` and `1` / `l`.

## Layout & Spacing
The layout model is architected around a 3-pane IDE cockpit:
1. **Left Canvas (Script & Breakpoints):** Resizable pane holding the high-readability Python editor.
2. **Right Canvas (Memory & Stack Engine):** Dual stacked sections illustrating active stack frames above and the live heap allocation diagram below.
3. **Bottom Stage (Playback Dock & Terminal Drawer):** Centered floating playback bar with collapsible terminal drawer.

- **Breakpoints:**
  - Desktop (`>= 1280px`): Full 3-pane side-by-side workspace.
  - Tablet (`768px - 1279px`): Editor full width with tabbed switching between Code, Memory Heap, and Call Stack. Floating timeline docks to bottom center.
  - Mobile (`< 768px`): Stacked vertical view optimized for scrubber review and step playback.

## Elevation & Depth
Elevation is realized exclusively through optical transmission, specular rim highlights, and ambient glow fields rather than opaque drop shadows:

- **Level 0 (Canvas Base):** Deep Space Navy (`#0B0F1A`) with ambient radial gradients of violet (`rgba(124, 92, 255, 0.08)`) and cyan (`rgba(34, 211, 238, 0.05)`) positioned dynamically behind active data structures.
- **Level 1 (Panels & Diagrams):** Translucent frost `rgba(255, 255, 255, 0.06)`, `backdrop-filter: blur(24px)`. Rim border `1px solid rgba(255, 255, 255, 0.12)`, upper edge specular line `rgba(255, 255, 255, 0.25)`, drop shadow `0 8px 32px rgba(0, 0, 0, 0.45)`.
- **Level 2 (Data Substrates):** Darkened reading glass `rgba(11, 15, 26, 0.65)`, `backdrop-filter: blur(20px)`, border `1px solid rgba(255, 255, 255, 0.08)`. Eliminates glare behind high-density monospace code.
- **Level 3 (Floating Docks & Modals):** High-density frost `rgba(255, 255, 255, 0.10)`, `backdrop-filter: blur(32px)`, border `1px solid rgba(255, 255, 255, 0.20)`, shadow `0 16px 48px rgba(0, 0, 0, 0.65)`.
- **Glow Accents:**
  - Active Executing Node: `0 0 16px rgba(34, 211, 238, 0.35)`
  - Active Breakpoint: `0 0 12px rgba(248, 113, 113, 0.45)`
  - Mutated Heap Cell: `0 0 16px rgba(251, 191, 36, 0.30)`

## Shapes
Surfaces adopt structured rounded geometry (`16px` / `rounded-2xl` for containers and floating docks) to soften the analytical rigidity of code. Component pills, step markers, and control tags use full radius (`rounded-full`) for quick tactile identification. Inner data rows, memory cells, and code highlights sit at `8px` (`rounded-lg`).

## Components

### Glass Pill Buttons
- Capsule geometry (`rounded-full`) with `rgba(255, 255, 255, 0.08)` fill and `1px` border `rgba(255, 255, 255, 0.15)`.
- Top edge inset specular highlight `inset 0 1px 0 rgba(255, 255, 255, 0.25)`.
- **Hover:** Background brightens to `rgba(255, 255, 255, 0.14)`, primary actions trigger a `#7C5CFF` soft ambient glow (`0 0 20px rgba(124, 92, 255, 0.4)`).

### Execution Timeline Playback Scrubber
- Floating elevated glass dock anchored `24px` above the bottom workspace edge.
- Controls: Step Back, Play / Pause toggle, Step Next, Execution Speed Slider (`0.25x` to `4x`).
- Step Counter: Monospace counter display (`STEP 04 / 18`) set in `code-sm` over muted glass background.
- Scrubber track features a glowing `#22D3EE` progress fill with pulsing playback thumb.

### Code Editor & Trace Line Highlighting
- Backed by Level 2 dark contrast glass for code legibility.
- Active Line Highlight: Full-width bar filled with `rgba(34, 211, 238, 0.08)`, a solid `2px` left border in `#22D3EE`, and a trailing right glow.
- Breakpoints: Circular toggles in line gutter, glowing `#F87171` when armed.
- Execution arrow marker: Vector glyph `#22D3EE` smoothly transitioning vertically via CSS transform animations.

### Call Stack Frames & Memory Heap Diagram
- **Stack Frames:** Card containers stacked vertically; active frame receives a `#7C5CFF` border and header accent.
- **Heap Objects:** Node boxes displaying memory IDs (`0x7ffe...`) in `label-caps`. Primitive items appear as compact badges; arrays, hash tables, and linked lists show pointer connection lines rendered with SVG curves tinted to their source variables.
- **Mutated Cells:** Blink briefly with `#FBBF24` amber glow on memory write steps.

### Terminal & Console Drawer
- Expandable bottom panel with tabs for `stdout`, `stderr`, and `Runtime Stats` (time elapsed, peak memory, opcode count).
- Monospace output styling in `code-md` using `#F1F5F9`.

### Preset Problem Selector
- Pill dropdown containing common interview setups (Two Sum, LRU Cache, Binary Tree DFS).
- Dropdown menu renders as elevated glass with subtle divider lines (`rgba(255, 255, 255, 0.08)`).