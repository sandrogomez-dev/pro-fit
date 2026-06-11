/**
 * Typography tokens. Athletic & energetic: big, bold, tight. Headers lean on heavy
 * weights + uppercase + letter-spacing. Use these instead of raw values in components.
 */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  hero: 40,
  // The on-screen rest-timer countdown — must be legible across the gym.
  display: 64,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

/** Letter-spacing scale. Wide tracking on uppercase labels reads as "athletic". */
export const tracking = {
  tight: -0.5,
  normal: 0,
  wide: 1,
  wider: 2,
} as const;

export type FontSizeToken = keyof typeof fontSize;
export type FontWeightToken = keyof typeof fontWeight;
export type TrackingToken = keyof typeof tracking;
