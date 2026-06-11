/**
 * Color tokens. Dark mode by default (AGENTS.md §9).
 * Never hardcode a color in a component — import from here.
 */
export const colors = {
  // Surfaces
  background: '#0B0B0F',
  surface: '#15151C',
  surfaceElevated: '#1F1F2A',
  border: '#2A2A38',

  // Brand / accent
  accent: '#7C5CFF',
  accentMuted: '#4B3A99',

  // Semantic
  success: '#22C55E', // the green "done" check
  danger: '#EF4444',
  warning: '#F59E0B',

  // Text
  text: '#F5F5F7',
  textMuted: '#A1A1B5',
  textInverse: '#0B0B0F',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.6)',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
