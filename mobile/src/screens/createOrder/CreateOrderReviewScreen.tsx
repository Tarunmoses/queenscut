import { useNavigation } from '@react-navigation/native';
import { Customer, Order } from '@queenscut/shared';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../../api/client';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StepProgress } from '../../components/StepProgress';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { useCreateOrder } from './CreateOrderContext';

function currency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function CreateOrderReviewScreen() {
  const navigation = useNavigation<any>();
  const { draft, totalAmount, setAdvanceReceived, reset } = useCreateOrder();
  const [submitting, setSubmitting] = useState(false);

  const advance = Number(draft.advanceReceived) || 0;
  const balanceDue = totalAmount - advance;
  const paymentStatusLabel = advance <= 0 ? 'Unpaid' : advance >= totalAmount ? 'Paid' : 'Partially Paid';

  const onConfirm = async () => {
    setSubmitting(true);
    try {
      const customer = await api.post<Customer>('/customers', {
        name: draft.customerName,
        phone: draft.customerPhone,
      });

      await api.post<Order>('/orders', {
        customerId: customer.id,
        deliveryDate: draft.deliveryDate,
        advanceReceived: advance,
        items: draft.items.map((item) => ({
          apparelType: item.apparelType,
          measurements: item.measurements,
          designNotes: item.designNotes || undefined,
          amountCharged: Number(item.amountCharged) || 0,
        })),
      });

      reset();
      Alert.alert('Order saved', `${draft.customerName}'s order has been created.`, [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch (e) {
      Alert.alert('Couldn’t save order', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Review Order" dismiss="back" />
      <StepProgress step={3} total={3} label="Review & Save" />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.customerName}>{draft.customerName}</Text>
              <Text style={styles.customerPhone}>{draft.customerPhone}</Text>
            </View>
            <View style={styles.alignEnd}>
              <Text style={styles.metaLabel}>Delivery</Text>
              <Text style={styles.deliveryDate}>{draft.deliveryDate}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Items ({draft.items.length})</Text>
          {draft.items.map((item, index) => (
            <View
              key={index}
              style={[styles.itemRow, index < draft.items.length - 1 && styles.itemRowDivider]}
            >
              <View>
                <Text style={styles.itemType}>{item.apparelType}</Text>
                {!!item.designNotes && <Text style={styles.itemNotes}>{item.designNotes}</Text>}
              </View>
              <Text style={styles.itemPrice}>{currency(Number(item.amountCharged) || 0)}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Order Total</Text>
            <Text style={styles.paymentValue}>{currency(totalAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Advance received</Text>
            <View style={styles.advanceInputWrap}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput
                value={draft.advanceReceived}
                onChangeText={setAdvanceReceived}
                keyboardType="numeric"
                style={styles.advanceInput}
              />
            </View>
          </View>
          <View style={[styles.paymentRow, styles.balanceRow]}>
            <Text style={styles.balanceLabel}>Balance Due</Text>
            <Text style={styles.balanceValue}>{currency(Math.max(balanceDue, 0))}</Text>
          </View>
        </Card>

        <Card>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Order Status</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Not Started</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Payment Status</Text>
            <View style={[styles.statusPill, paymentPillStyle(paymentStatusLabel)]}>
              <Text style={[styles.statusPillText, paymentPillTextStyle(paymentStatusLabel)]}>
                {paymentStatusLabel}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} disabled={submitting}>
          <Text style={styles.backLabel}>← Back</Text>
        </Pressable>
        <Pressable style={styles.confirmButton} onPress={onConfirm} disabled={submitting}>
          <Text style={styles.confirmLabel}>{submitting ? 'Saving…' : '✓ Confirm & Save'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function paymentPillStyle(label: string) {
  if (label === 'Paid') return { backgroundColor: colors.successBg };
  if (label === 'Partially Paid') return { backgroundColor: colors.badgeCautionBg };
  return { backgroundColor: colors.badgeUrgentBg };
}
function paymentPillTextStyle(label: string) {
  if (label === 'Paid') return { color: colors.success };
  if (label === 'Partially Paid') return { color: colors.badgeCautionText };
  return { color: colors.badgeUrgentText };
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
  card: { marginBottom: spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  customerName: { fontSize: fontSize.title, fontWeight: '600', color: colors.text },
  customerPhone: { fontSize: fontSize.small, color: colors.textSecondary, marginTop: 2 },
  metaLabel: { fontSize: fontSize.caption, color: colors.textTertiary },
  deliveryDate: { fontSize: fontSize.body, fontWeight: '600', color: colors.secondary, marginTop: 2 },
  cardTitle: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  itemRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.surfaceAlt },
  itemType: { fontSize: fontSize.bodyLg, fontWeight: '500', color: colors.text },
  itemNotes: { fontSize: fontSize.caption, color: colors.textTertiary, marginTop: 2 },
  itemPrice: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.text },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  paymentLabel: { fontSize: fontSize.bodyLg, color: colors.text },
  paymentValue: { fontSize: fontSize.subheading, fontWeight: '600', color: colors.text },
  advanceInputWrap: {
    width: 130,
    height: 44,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  rupee: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.secondary, marginRight: 4 },
  advanceInput: { flex: 1, textAlign: 'right', fontSize: fontSize.subheading, fontWeight: '600', color: colors.text },
  balanceRow: { paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 0 },
  balanceLabel: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.text },
  balanceValue: { fontSize: fontSize.titleLg, fontWeight: String(fontWeight.bold) as '700', color: colors.secondary },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  statusLabel: { fontSize: fontSize.body, color: colors.textSecondary },
  statusPill: { backgroundColor: colors.badgeMildBg, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full },
  statusPillText: { fontSize: fontSize.small, fontWeight: '600', color: colors.badgeMildText },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: { fontSize: fontSize.bodyLg, fontWeight: '500', color: colors.text },
  confirmButton: {
    flex: 2,
    height: 48,
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.white },
});
