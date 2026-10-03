import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Expense, Order } from '@queenscut/shared';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { Card } from '../components/Card';
import { ExpenseRow } from '../components/ExpenseRow';
import { PromptModal } from '../components/PromptModal';
import { ScreenHeader } from '../components/ScreenHeader';
import { LOWER_BODY_FIELDS, UPPER_BODY_FIELDS } from './createOrder/measurementFields';
import { colors, fontSize, radius, spacing } from '../theme';
import { subOrderExpenses } from '../utils/expenseFilters';

const ALL_FIELDS = [...UPPER_BODY_FIELDS, ...LOWER_BODY_FIELDS];

function currency(amount: number) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function OrderItemDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId, orderItemId } = route.params as { orderId: string; orderItemId: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amountModalOpen, setAmountModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const item = order?.items?.find((i) => i.id === orderItemId);

  const saveAmount = async (value: string) => {
    const amountCharged = Number(value);
    if (!amountCharged && amountCharged !== 0) return;
    setSaving(true);
    try {
      await api.patch(`/orders/${orderId}/items/${orderItemId}`, { amountCharged });
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (!order || !item) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  const filledMeasurements = ALL_FIELDS.filter((f) => item.measurements?.[f.key]);
  const itemExpenses = subOrderExpenses(expenses, item.id);

  return (
    <View style={styles.flex}>
      <ScreenHeader title={item.apparelType} subtitle={order.customer?.name} dismiss="back" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount Charged</Text>
            <Text style={styles.amountValue}>{currency(item.amountCharged)}</Text>
          </View>
          {!!item.designNotes && (
            <>
              <Text style={styles.sectionLabel}>Design Notes</Text>
              <Text style={styles.notesText}>{item.designNotes}</Text>
            </>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Measurements</Text>
          {filledMeasurements.length === 0 ? (
            <Text style={styles.empty}>No measurements recorded.</Text>
          ) : (
            <View style={styles.measurementsGrid}>
              {filledMeasurements.map((f) => (
                <View key={f.key} style={styles.measurementCell}>
                  <Text style={styles.measurementLabel}>{f.label}</Text>
                  <Text style={styles.measurementValue}>{item.measurements[f.key]}"</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Expenses</Text>
          {itemExpenses.length === 0 ? (
            <Text style={styles.empty}>No expenses logged for this item.</Text>
          ) : (
            itemExpenses.map((e) => <ExpenseRow key={e.id} expense={e} />)
          )}
        </Card>

        {saving && <ActivityIndicator color={colors.secondary} />}

        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditMeasurements', { orderId, orderItemId })}
          >
            <Text style={styles.actionButtonLabel}>Edit Measurements</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => setAmountModalOpen(true)}>
            <Text style={styles.actionButtonLabel}>Edit Amount</Text>
          </Pressable>
        </View>
      </ScrollView>

      <PromptModal
        visible={amountModalOpen}
        title="Edit Amount"
        label="Amount Charged (₹)"
        initialValue={String(item.amountCharged)}
        keyboardType="numeric"
        onClose={() => setAmountModalOpen(false)}
        onSave={saveAmount}
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
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountLabel: { fontSize: fontSize.bodyLg, color: colors.textSecondary },
  amountValue: { fontSize: fontSize.title, fontWeight: '700', color: colors.secondary },
  sectionLabel: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  notesText: { fontSize: fontSize.body, color: colors.text, lineHeight: 20 },
  measurementsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  measurementCell: { width: '50%', marginBottom: spacing.sm },
  measurementLabel: { fontSize: fontSize.caption, color: colors.textTertiary },
  measurementValue: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.text, marginTop: 2 },
  empty: { fontSize: fontSize.body, color: colors.textTertiary },
  actions: { gap: spacing.md, marginTop: spacing.sm },
  actionButton: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonLabel: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.secondary },
});
