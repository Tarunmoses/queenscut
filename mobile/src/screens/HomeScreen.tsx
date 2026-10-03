import { useNavigation } from '@react-navigation/native';
import { Order, OrderStatus } from '@queenscut/shared';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';

function todayLabel() {
  return new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function isToday(dateStr: string) {
  return dateStr.slice(0, 10) === new Date().toISOString().slice(0, 10);
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
  const dueTodayCount = orders!.filter(
    (o) => o.status !== OrderStatus.COMPLETE && isToday(o.deliveryDate),
  ).length;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
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
        <View style={[styles.statTile, { backgroundColor: colors.badgeMildBg }]}>
          <Text style={[styles.statValue, { color: colors.badgeMildText }]}>{dueTodayCount}</Text>
          <Text style={[styles.statLabel, { color: colors.badgeMildText }]}>Due Today</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.newOrderButton} onPress={() => navigation.navigate('CreateOrderStep1')}>
          <Text style={styles.newOrderLabel}>+ New Order</Text>
        </Pressable>

        <Pressable style={styles.searchButton} onPress={() => navigation.navigate('SearchOrders')}>
          <Text style={styles.searchLabel}>🔍 Search / View Orders</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  content: { flexGrow: 1 },
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
    gap: spacing.sm,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statTile: { flex: 1, borderRadius: radius.xl, paddingVertical: spacing.md, alignItems: 'center' },
  statValue: { fontSize: fontSize.heading, fontWeight: '600' },
  statLabel: { fontSize: fontSize.caption, marginTop: spacing.xs, fontWeight: '600' },
  actions: { padding: spacing.lg, gap: spacing.md },
  newOrderButton: {
    height: 72,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  newOrderLabel: { fontSize: fontSize.headingLg, fontWeight: String(fontWeight.bold) as '700', color: colors.text },
  searchButton: {
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchLabel: { fontSize: fontSize.subheading, fontWeight: '600', color: colors.secondary },
});
