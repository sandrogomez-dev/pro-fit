/**
 * Spacing + sizing tokens. 4pt base scale.
 * Large tap targets are a hard requirement (AGENTS.md §9) — use `hitSlop` /
 * `minTapTarget` for anything tappable mid-set.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/** Minimum tap target — usable sweaty, one-handed, at a glance. */
export const minTapTarget = 56;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
