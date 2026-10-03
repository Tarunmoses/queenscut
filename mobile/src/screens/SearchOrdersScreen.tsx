import { useNavigation } from '@react-navigation/native';
import { Order, matchesOrderId, shortOrderId } from '@queenscut/shared';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { OrderStatusBadge } from '../components/StatusBadge';
import { TextField } from '../components/TextField';
import { colors, fontSize, spacing } from '../theme';

export function SearchOrdersScreen() {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const data = await api.get<Order[]>('/orders');
    setOrders(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = (orders ?? []).filter(
    (o) =>
      !search.trim() ||
      (o.customer?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      matchesOrderId(o.id, search),
  );

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Search Orders" dismiss="back" />
      <View style={styles.searchWrap}>
        <TextField value={search} onChangeText={setSearch} placeholder="Search by order ID or customer..." style={styles.searchInput} />
      </View>

      {!orders ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(order) => order.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: order }) => (
            <Pressable onPress={() => navigation.navigate('ViewOrder', { orderId: order.id })}>
              <Card style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <View style={styles.flex1}>
                    <Text style={styles.orderIdText}>{shortOrderId(order.id)}</Text>
                    <Text style={styles.orderTitle}>{order.customer?.name ?? 'Unknown customer'}</Text>
                    <Text style={styles.orderMeta}>{order.items?.length ?? 0} item(s)</Text>
                  </View>
                  <OrderStatusBadge status={order.status} />
                </View>
                <Text style={styles.orderFooter}>
                  Delivery:{' '}
                  {new Date(order.deliveryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </Text>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No orders match your search.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1 },
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface },
  searchInput: { height: 36, fontSize: fontSize.body },
  list: { padding: spacing.md, backgroundColor: colors.background, flexGrow: 1 },
  orderCard: { marginBottom: spacing.md },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  orderIdText: { fontSize: fontSize.caption, color: colors.textTertiary, fontWeight: '600' },
  orderTitle: { fontSize: fontSize.bodyLg, fontWeight: '500', color: colors.text },
  orderMeta: { fontSize: fontSize.small, color: colors.textSecondary, marginTop: 2 },
  orderFooter: { fontSize: fontSize.small, color: colors.textSecondary },
  empty: { textAlign: 'center', color: colors.textTertiary, marginTop: spacing.xl },
});
