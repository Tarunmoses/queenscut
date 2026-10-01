/**
 * Spacing & radius scale extracted from frequency analysis of the locked
 * artboards (padding/margin/border-radius usage across all 32 screens).
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

export const componentSize = {
  buttonHeight: 48,
  buttonHeightCompact: 44,
  inputHeight: 44,
  avatarSm: 36,
  avatarMd: 56,
  iconSm: 20,
  iconMd: 24,
  tabBarHeight: 60,
  sidebarWidth: 240,
} as const;
