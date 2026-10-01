/**
 * Typography scale extracted from frequency analysis of the locked artboards
 * (font-size/font-weight usage across all 32 screens).
 */
export const fontFamily = {
  base: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const;

export const fontSize = {
  caption: 11,
  small: 12,
  body: 13,
  bodyLg: 14,
  subheading: 16,
  title: 18,
  titleLg: 20,
  heading: 24,
  headingLg: 28,
  display: 36,
  hero: 56,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;
