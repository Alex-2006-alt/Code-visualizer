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
