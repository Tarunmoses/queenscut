import { colors, componentSize, fontSize, fontWeight, radius, spacing } from '@queenscut/shared';

export { colors, componentSize, fontSize, fontWeight, radius, spacing };

/**
 * The shared `fontFamily.base` is a web CSS font-stack string, which React
 * Native can't use directly — RN resolves the platform system font when
 * `fontFamily` is left undefined, so we do that here instead of porting the
 * web stack over.
 */
export const fontFamily = undefined;
