import { useNavigation, useRoute } from '@react-navigation/native';
import { Order, OrderStatus, PaymentStatus } from '@queenscut/shared';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { SelectField } from '../components/SelectField';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';

function currency(amount: number) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

const STATUS_OPTIONS = [OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.COMPLETE];
const PAYMENT_OPTIONS = [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID, PaymentStatus.PAID];

export function ViewOrderScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params as { orderId: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await api.get<Order>(`/orders/${orderId}`);
    setOrder(data);
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const updateField = async (field: 'status' | 'paymentStatus', value: string) => {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await api.patch<Order>(`/orders/${orderId}`, { [field]: value });
      setOrder(updated);
    } finally {
      setSaving(false);
    }
  };

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <ScreenHeader title={order.customer?.name ?? 'Order'} dismiss="back" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Customer</Text>
            <Text style={styles.summaryValue}>{order.customer?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>{order.deliveryDate}</Text>
          </View>
          <View style={styles.selectRow}>
            <SelectField
              label="Status"
              value={order.status}
              onChange={(v) => updateField('status', v)}
              options={STATUS_OPTIONS}
            />
          </View>
          <View style={styles.selectRow}>
            <SelectField
              label="Payment"
              value={order.paymentStatus}
              onChange={(v) => updateField('paymentStatus', v)}
              options={PAYMENT_OPTIONS}
            />
          </View>
          {saving && <ActivityIndicator color={colors.secondary} />}
        </Card>

        <Text style={styles.itemsHeading}>Items in Order ({order.items?.length ?? 0})</Text>
        {order.items?.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <View style={styles.itemTop}>
              <Text style={styles.itemType}>{item.apparelType}</Text>
              <Text style={styles.itemPrice}>{currency(item.amountCharged)}</Text>
            </View>
            {!!item.designNotes && <Text style={styles.itemNotes}>{item.designNotes}</Text>}
          </Card>
        ))}

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Order Total</Text>
          <Text style={styles.totalValue}>{currency(order.totalAmount)}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md },
  card: { marginBottom: spacing.md },
  cardTitle: { fontSize: fontSize.bodyLg, fontWeight: '500', color: colors.text, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { fontSize: fontSize.body, color: colors.textSecondary },
  summaryValue: { fontSize: fontSize.body, fontWeight: '500', color: colors.text },
  selectRow: { marginTop: spacing.xs },
  itemsHeading: { fontSize: fontSize.bodyLg, fontWeight: '500', color: colors.textSecondary, marginBottom: spacing.sm },
  itemCard: { marginBottom: spacing.md },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  itemType: { fontSize: fontSize.bodyLg, fontWeight: '500', color: colors.text },
  itemPrice: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.text },
  itemNotes: { fontSize: fontSize.small, color: colors.textSecondary, lineHeight: 17 },
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  totalLabel: { fontSize: fontSize.small, color: colors.text, opacity: 0.8 },
  totalValue: { fontSize: fontSize.heading, fontWeight: String(fontWeight.semibold) as '600', color: colors.text, marginTop: 4 },
});
