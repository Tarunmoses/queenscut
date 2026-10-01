import { useNavigation } from '@react-navigation/native';
import { Order, OrderStatus } from '@queenscut/shared';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../api/client';
import { OrderStatusBadge } from '../components/StatusBadge';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';

function todayLabel() {
  return new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<Order[]>('/orders');
      setOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!orders && !error) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Couldn't reach the API.</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  const activeCount = orders!.filter((o) => o.status !== OrderStatus.COMPLETE).length;
  const pendingCount = orders!.filter((o) => o.status === OrderStatus.PENDING).length;
  const thisWeek = orders!.filter((o) => o.status !== OrderStatus.COMPLETE).slice(0, 10);

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Orders</Text>
        <Text style={styles.headerDate}>{todayLabel()}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statTile, { backgroundColor: colors.successBg }]}>
          <Text style={[styles.statValue, { color: colors.success }]}>{activeCount}</Text>
          <Text style={[styles.statLabel, { color: colors.success }]}>Active</Text>
        </View>
        <View style={[styles.statTile, { backgroundColor: colors.warningBg }]}>
          <Text style={[styles.statValue, { color: colors.warning }]}>{pendingCount}</Text>
          <Text style={[styles.statLabel, { color: colors.warning }]}>Pending</Text>
        </View>
      </View>

      <View style={styles.newOrderWrap}>
        <Pressable style={styles.newOrderButton} onPress={() => navigation.navigate('CreateOrderStep1')}>
          <Text style={styles.newOrderLabel}>+ New Order</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>This Week</Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {thisWeek.map((order) => (
          <Pressable
            key={order.id}
            style={styles.orderCard}
            onPress={() => navigation.navigate('ViewOrder', { orderId: order.id })}
          >
            <View style={styles.orderTop}>
              <View style={styles.flex1}>
                <Text style={styles.orderTitle}>{order.customer?.name ?? 'Unknown customer'}</Text>
                <Text style={styles.orderMeta}>{order.items?.length ?? 0} item(s)</Text>
              </View>
              <OrderStatusBadge status={order.status} />
            </View>
            <Text style={styles.orderFooter}>
              Delivery: {new Date(order.deliveryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </Text>
          </Pressable>
        ))}
        {thisWeek.length === 0 && (
          <Text style={styles.empty}>No active orders — tap "+ New Order" to create one.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  flex1: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  errorText: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.text },
  errorDetail: { fontSize: fontSize.body, color: colors.textSecondary, textAlign: 'center' },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: fontSize.heading, fontWeight: String(fontWeight.medium) as '500', color: colors.text },
  headerDate: { fontSize: fontSize.body, color: colors.textSecondary, marginTop: spacing.xs },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statTile: { flex: 1, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: fontSize.heading, fontWeight: '600' },
  statLabel: { fontSize: fontSize.small, marginTop: spacing.xs },
  newOrderWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  newOrderButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newOrderLabel: { fontSize: fontSize.subheading, fontWeight: '600', color: colors.text },
  sectionLabel: {
    fontSize: fontSize.bodyLg,
    fontWeight: String(fontWeight.medium) as '500',
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md },
  orderCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  orderTitle: { fontSize: fontSize.bodyLg, fontWeight: String(fontWeight.medium) as '500', color: colors.text },
  orderMeta: { fontSize: fontSize.small, color: colors.textSecondary, marginTop: 2 },
  orderFooter: { fontSize: fontSize.small, color: colors.textSecondary },
  empty: { textAlign: 'center', color: colors.textTertiary, marginTop: spacing.xl },
});
