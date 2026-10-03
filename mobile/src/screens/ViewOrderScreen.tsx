import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Expense, Order, OrderStatus, PaymentStatus, shortOrderId } from '@queenscut/shared';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { Card } from '../components/Card';
import { ExpenseRow } from '../components/ExpenseRow';
import { OptionPickerModal } from '../components/OptionPickerModal';
import { ScreenHeader } from '../components/ScreenHeader';
import { OrderStatusBadge, PaymentStatusBadge } from '../components/StatusBadge';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';
import { orderLevelExpenses, subOrderExpenses } from '../utils/expenseFilters';

function currency(amount: number) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

const STATUS_OPTIONS = [
  { value: OrderStatus.PENDING, label: 'Not Started' },
  { value: OrderStatus.IN_PROGRESS, label: 'In Progress' },
  { value: OrderStatus.COMPLETE, label: 'Complete' },
];
const PAYMENT_OPTIONS = [
  { value: PaymentStatus.UNPAID, label: 'Unpaid' },
  { value: PaymentStatus.PARTIALLY_PAID, label: 'Partially Paid' },
  { value: PaymentStatus.PAID, label: 'Paid' },
];

export function ViewOrderScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params as { orderId: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [saving, setSaving] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const load = useCallback(async () => {
    const [orderData, expensesData] = await Promise.all([
      api.get<Order>(`/orders/${orderId}`),
      api.get<Expense[]>('/expenses'),
    ]);
    setOrder(orderData);
    setExpenses(expensesData);
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const updateField = async (field: 'status' | 'paymentStatus', value: string) => {
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

  const orderExpenses = orderLevelExpenses(expenses, order.id);

  return (
    <View style={styles.flex}>
      <ScreenHeader
        title={order.customer?.name ?? 'Order'}
        subtitle={shortOrderId(order.id)}
        dismiss="back"
      />
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
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status</Text>
            <OrderStatusBadge status={order.status} />
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment</Text>
            <PaymentStatusBadge status={order.paymentStatus} />
          </View>
          {saving && <ActivityIndicator color={colors.secondary} style={styles.savingIndicator} />}
        </Card>

        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButton} onPress={() => setStatusModalOpen(true)}>
            <Text style={styles.actionButtonLabel}>Edit Status</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => setPaymentModalOpen(true)}>
            <Text style={styles.actionButtonLabel}>Edit Payment</Text>
          </Pressable>
        </View>

        <Text style={styles.itemsHeading}>Items in Order ({order.items?.length ?? 0})</Text>
        {order.items?.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => navigation.navigate('OrderItemDetail', { orderId: order.id, orderItemId: item.id })}
          >
            <Card style={styles.itemCard}>
              <View style={styles.itemTop}>
                <Text style={styles.itemType}>{item.apparelType}</Text>
                <Text style={styles.itemPrice}>{currency(item.amountCharged)}</Text>
              </View>
              {!!item.designNotes && <Text style={styles.itemNotes}>{item.designNotes}</Text>}
              <Text style={styles.itemChevronHint}>View details ›</Text>
            </Card>
          </Pressable>
        ))}

        <Text style={styles.itemsHeading}>Expenses</Text>
        <Card style={styles.card}>
          <Text style={styles.expenseGroupTitle}>Order-level</Text>
          {orderExpenses.length === 0 ? (
            <Text style={styles.empty}>No order-level expenses logged.</Text>
          ) : (
            orderExpenses.map((e) => <ExpenseRow key={e.id} expense={e} />)
          )}

          {order.items?.map((item) => {
            const itemExpenses = subOrderExpenses(expenses, item.id);
            return (
              <View key={item.id} style={styles.expenseGroup}>
                <Text style={styles.expenseGroupTitle}>{item.apparelType}</Text>
                {itemExpenses.length === 0 ? (
                  <Text style={styles.empty}>No expenses logged for this item.</Text>
                ) : (
                  itemExpenses.map((e) => <ExpenseRow key={e.id} expense={e} />)
                )}
              </View>
            );
          })}
        </Card>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Order Total</Text>
          <Text style={styles.totalValue}>{currency(order.totalAmount)}</Text>
        </View>
      </ScrollView>

      <OptionPickerModal
        visible={statusModalOpen}
        title="Edit Status"
        options={STATUS_OPTIONS}
        currentValue={order.status}
        onClose={() => setStatusModalOpen(false)}
        onSave={(value) => updateField('status', value)}
      />
      <OptionPickerModal
        visible={paymentModalOpen}
        title="Edit Payment"
        options={PAYMENT_OPTIONS}
        currentValue={order.paymentStatus}
        onClose={() => setPaymentModalOpen(false)}
        onSave={(value) => updateField('paymentStatus', value)}
      />
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
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  summaryLabel: { fontSize: fontSize.body, color: colors.textSecondary },
  summaryValue: { fontSize: fontSize.body, fontWeight: '500', color: colors.text },
  savingIndicator: { marginTop: spacing.xs },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  actionButton: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonLabel: { fontSize: fontSize.body, fontWeight: '600', color: colors.secondary },
  itemsHeading: { fontSize: fontSize.bodyLg, fontWeight: '500', color: colors.textSecondary, marginBottom: spacing.sm },
  itemCard: { marginBottom: spacing.md },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  itemType: { fontSize: fontSize.bodyLg, fontWeight: '500', color: colors.text },
  itemPrice: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.text },
  itemNotes: { fontSize: fontSize.small, color: colors.textSecondary, lineHeight: 17 },
  itemChevronHint: { fontSize: fontSize.caption, color: colors.primary, marginTop: spacing.sm, fontWeight: '600' },
  expenseGroup: { marginTop: spacing.md },
  expenseGroupTitle: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  empty: { fontSize: fontSize.small, color: colors.textTertiary, paddingVertical: spacing.xs },
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
