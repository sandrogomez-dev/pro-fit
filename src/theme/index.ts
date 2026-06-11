/**
 * Single entry point for all design tokens.
 * Components import from `@/theme`, never from individual token files or with
 * hardcoded values (AGENTS.md §8, §9).
 */
import { colors } from './colors';
import { spacing, radius, minTapTarget } from './spacing';
import { fontSize, fontWeight } from './typography';

export { colors, type ColorToken } from './colors';
export {
  spacing,
  radius,
  minTapTarget,
  type SpacingToken,
  type RadiusToken,
} from './spacing';
export {
  fontSize,
  fontWeight,
  type FontSizeToken,
  type FontWeightToken,
} from './typography';

export const theme = {
  colors,
  spacing,
  radius,
  minTapTarget,
  fontSize,
  fontWeight,
} as const;

export type Theme = typeof theme;
