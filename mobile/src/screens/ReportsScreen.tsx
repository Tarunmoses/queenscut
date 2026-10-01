import { useFocusEffect } from '@react-navigation/native';
import { Expense, InventoryItem, Order, OrderStatus } from '@queenscut/shared';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';

const TABS = ['This Month', 'Trends', 'Inventory'];

function currency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function monthLabel() {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function ReportsScreen() {
  const [tab, setTab] = useState(TABS[0]);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[] | null>(null);

  const load = useCallback(async () => {
    const [ordersData, expensesData, inventoryData] = await Promise.all([
      api.get<Order[]>('/orders'),
      api.get<Expense[]>('/expenses'),
      api.get<InventoryItem[]>('/inventory'),
    ]);
    setOrders(ordersData);
    setExpenses(expensesData);
    setInventory(inventoryData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const topItems = useMemo(() => {
    if (!orders) return [];
    const byType = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items ?? []) {
        byType.set(item.apparelType, (byType.get(item.apparelType) ?? 0) + Number(item.amountCharged));
      }
    }
    const sorted = [...byType.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([type, revenue]) => ({ type, revenue, pct: (revenue / max) * 100 }));
  }, [orders]);

  if (!orders || !expenses || !inventory) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const completed = orders.filter((o) => o.status === OrderStatus.COMPLETE).length;
  const pendingOrders = orders.filter((o) => Number(o.balanceDue) > 0);
  const pendingPayment = pendingOrders.reduce((sum, o) => sum + Number(o.balanceDue), 0);
  const inventoryValue = inventory.reduce((sum, i) => sum + Number(i.quantity) * Number(i.costPerUnit), 0);
  const lowStockCount = inventory.filter((i) => i.status !== 'ok').length;

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSubtitle}>{monthLabel()}</Text>
      </View>
      <SegmentedTabs options={TABS} value={tab} onChange={setTab} />

      {tab !== 'This Month' ? (
        <View style={styles.center}>
          <Text style={styles.comingSoon}>
            {tab} reporting is a good next iteration once there's more historical data to chart.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.metricsGrid}>
            <MetricCard label="REVENUE" value={currency(revenue)} valueColor={colors.primary} />
            <MetricCard label="COMPLETED" value={String(completed)} sub="Orders" valueColor={colors.primary} />
            <MetricCard
              label="PENDING PAYMENT"
              value={currency(pendingPayment)}
              sub={`${pendingOrders.length} orders`}
              valueColor={colors.accent}
            />
            <MetricCard
              label="INVENTORY"
              value={currency(inventoryValue)}
              sub={`${lowStockCount} items low`}
              valueColor={colors.primary}
            />
          </View>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Top Items by Revenue</Text>
            {topItems.map(({ type, revenue: itemRevenue, pct }) => (
              <View key={type} style={styles.itemRow}>
                <View style={styles.itemRowTop}>
                  <Text style={styles.itemType}>{type}</Text>
                  <Text style={styles.itemRevenue}>{currency(itemRevenue)}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
              </View>
            ))}
            {topItems.length === 0 && <Text style={styles.empty}>No order items yet.</Text>}
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

function MetricCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
      {sub && <Text style={styles.metricSub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  comingSoon: { textAlign: 'center', color: colors.textTertiary },
  header: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  headerTitle: { fontSize: fontSize.heading, fontWeight: String(fontWeight.medium) as '500', color: colors.text },
  headerSubtitle: { fontSize: fontSize.small, color: colors.textSecondary, marginTop: spacing.xs },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
  metricCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  metricLabel: { fontSize: fontSize.caption, color: colors.textSecondary, fontWeight: '600' },
  metricValue: { fontSize: fontSize.title, fontWeight: '600', marginTop: 4 },
  metricSub: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 4 },
  card: { marginBottom: spacing.md },
  cardTitle: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.text, marginBottom: spacing.md },
  itemRow: { marginBottom: spacing.md },
  itemRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemType: { fontSize: fontSize.small, color: colors.text },
  itemRevenue: { fontSize: fontSize.small, fontWeight: '600', color: colors.text },
  barTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary },
  empty: { textAlign: 'center', color: colors.textTertiary },
});
