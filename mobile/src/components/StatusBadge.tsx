import { InventoryStatus, OrderStatus, PaymentStatus } from '@queenscut/shared';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

type Tier = 'mild' | 'caution' | 'urgent' | 'success';

function tierColors(tier: Tier) {
  switch (tier) {
    case 'success':
      return { bg: colors.successBg, fg: colors.success };
    case 'caution':
      return { bg: colors.badgeCautionBg, fg: colors.badgeCautionText };
    case 'urgent':
      return { bg: colors.badgeUrgentBg, fg: colors.badgeUrgentText };
    case 'mild':
    default:
      return { bg: colors.badgeMildBg, fg: colors.badgeMildText };
  }
}

function Pill({ tier, label, icon }: { tier: Tier; label: string; icon?: string }) {
  const { bg, fg } = tierColors(tier);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>
        {label}
        {icon ? ` ${icon}` : ''}
      </Text>
    </View>
  );
}

// PENDING reads as the "needs attention, nothing started" state — IN_PROGRESS
// is the calmer mid-state, COMPLETE breaks from the 3-tier scale entirely
// (green), matching the confirmed "Complete"/"Paid" treatment from the web screens.
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case OrderStatus.COMPLETE:
      return <Pill tier="success" label="Complete" />;
    case OrderStatus.IN_PROGRESS:
      return <Pill tier="mild" label="In Progress" />;
    case OrderStatus.PENDING:
    default:
      return <Pill tier="urgent" label="Not Started" />;
  }
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case PaymentStatus.PAID:
      return <Pill tier="success" label="Paid" />;
    case PaymentStatus.PARTIALLY_PAID:
      return <Pill tier="caution" label="Partially Paid" />;
    case PaymentStatus.UNPAID:
    default:
      return <Pill tier="urgent" label="Unpaid" />;
  }
}

export function InventoryStatusBadge({ status }: { status: InventoryStatus }) {
  switch (status) {
    case InventoryStatus.CRITICAL:
      return <Pill tier="urgent" label="CRITICAL" icon="🔴" />;
    case InventoryStatus.LOW:
      return <Pill tier="caution" label="LOW" icon="⚠" />;
    case InventoryStatus.OK:
    default:
      return <Pill tier="mild" label="OK" icon="✓" />;
  }
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: fontSize.caption,
    fontWeight: '600',
  },
});
