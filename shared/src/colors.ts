/**
 * QueensCut "Romantic Luxury" color palette.
 * Core 5 colors are locked by design; semantic/neutral colors were extracted
 * from actual usage across the 32 locked artboards (not guessed).
 */
export const colors = {
  // Locked brand colors
  primary: '#E8C1D1', // Pale Royal Pink
  secondary: '#6B4C5C', // Deep Mauve
  accent: '#D4AF77', // Champagne Gold
  background: '#FAF7F2', // Cream
  text: '#2A2A2A', // Deep Charcoal

  white: '#FFFFFF',

  // Text variants (observed across artboards)
  textSecondary: '#666666',
  textTertiary: '#999999',
  textOnDark: '#FAF7F2',

  // Surfaces / borders (observed across artboards)
  surface: '#FFFFFF',
  surfaceMuted: '#F8F8F8',
  surfaceSubtle: '#F5F5F5',
  surfaceAlt: '#F0F0F0',
  border: '#E5E5E5',
  borderStrong: '#CCCCCC',
  divider: '#D0D0D0',

  // Dashboard stat-tile tints (KPI boxes on Home/Reports) — distinct from the
  // status-pill scale below. The design intentionally avoids a harsh red;
  // "critical"/"unpaid" reuse Deep Mauve with an emoji indicator instead.
  success: '#0F6E56',
  successBg: '#E1F5EE',
  warning: '#854F0B',
  warningBg: '#FFF4E6',
  critical: '#6B4C5C',
  criticalBg: '#6B4C5C',
  criticalText: '#FAF7F2',

  // Status-pill scale (order status, payment status, inventory status badges)
  // — a 3-tier solid-fill scale confirmed across Home/CreateOrderStep3/
  // InventoryStock mockups: mild (pink/mauve) -> caution (gold/cream) ->
  // urgent (mauve/cream). "Complete"/"Paid" use the green success tint above
  // instead, so completion reads as a distinct 4th state, not part of this scale.
  badgeMildBg: '#E8C1D1',
  badgeMildText: '#6B4C5C',
  badgeCautionBg: '#D4AF77',
  badgeCautionText: '#FAF7F2',
  badgeUrgentBg: '#6B4C5C',
  badgeUrgentText: '#FAF7F2',
} as const;

export type ColorToken = keyof typeof colors;
