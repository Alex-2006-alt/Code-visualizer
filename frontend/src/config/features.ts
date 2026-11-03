/**
 * CodeTrace Feature Flags Configuration
 *
 * Provides granular on/off switches for newly added major capabilities.
 * Set any flag to false to instantly deactivate the corresponding feature.
 */

export const FEATURES = {
  /** Debugger-style stepping (Step Over, Step Out, Step Into, Next Call, Continue, Breakpoints, Event Log) */
  DEBUGGER_CONTROLS: true,

  /** Linked List, Tree, and Graph Structure visualizer with SVG graphs */
  STRUCTURE_VISUALIZATION: true,

  /** Interactive standard input (stdin) drawer */
  STDIN_PANEL: true,

  /** Practice mode problem catalog and runner */
  PRACTICE_MODE: true,

  /** Trace sharing with step position and JSON/Markdown export */
  SHARE_AND_EXPORT: true,
} as const

export type FeatureKey = keyof typeof FEATURES

export const isFeatureEnabled = (key: FeatureKey): boolean => {
  return FEATURES[key] ?? false
}

/**
 * Standard library modules permitted inside the secure execution sandbox.
 * Synchronized with backend `app.config.ALLOWED_MODULES`.
 */
export const ALLOWED_MODULES = [
  'math',
  'random',
  'collections',
  'itertools',
  'heapq',
  'bisect',
  'functools',
  'string',
  're',
  'typing',
  'dataclasses',
  'copy',
  'json',
  'datetime',
  'time',
  'enum',
  'queue',
  'array',
  'cmath',
  'fractions',
  'statistics',
] as const

export type AllowedModule = typeof ALLOWED_MODULES[number]
