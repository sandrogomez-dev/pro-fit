/**
 * Color tokens. Dark mode by default (AGENTS.md §9).
 * Aesthetic: athletic & energetic — deep near-black surfaces, electric-lime accent,
 * high contrast. Never hardcode a color in a component — import from here.
 */
export const colors = {
  // Surfaces
  background: '#0A0B0D',
  surface: '#141619',
  surfaceElevated: '#1C1F24',
  border: '#2A2E36',

  // Brand / accent — electric lime. Use textInverse for text/icons on top of it.
  accent: '#C6FF00',
  accentMuted: '#3F4A14',
  accentDim: '#9ACB00',

  // Semantic
  success: '#3DDC84', // the green "done" check
  danger: '#FF4D4D',
  warning: '#FFB020',

  // Text
  text: '#F7F9FB',
  textMuted: '#888F9C',
  textFaint: '#5A616C',
  textInverse: '#0A0B0D',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.7)',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
