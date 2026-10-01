import { useNavigation } from '@react-navigation/native';
import { Order } from '@queenscut/shared';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { Button } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { TextField } from '../components/TextField';
import { colors, fontSize, radius, spacing } from '../theme';

export function AddExpenseScreen() {
  const navigation = useNavigation<any>();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Order[]>('/orders').then(setOrders).catch(() => setOrders([]));
  }, []);

  const toggleOrder = (id: string) =>
    setSelectedOrderIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  const onSave = async () => {
    if (!description || !amount) {
      Alert.alert('Missing details', 'Description and amount are required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/expenses', {
        description: notes ? `${description} — ${notes}` : description,
        amount: Number(amount),
        date,
        orderIds: selectedOrderIds.length ? selectedOrderIds : undefined,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Couldn’t save expense', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Add Expense" dismiss="back" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TextField
          label="Description *"
          value={description}
          onChangeText={setDescription}
          placeholder="e.g., Fuel, Transport, Materials"
        />
        <TextField label="Amount (₹) *" value={amount} onChangeText={setAmount} placeholder="500" keyboardType="numeric" />
        <TextField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

        <Text style={styles.label}>Link to Order (Optional)</Text>
        <View style={styles.orderList}>
          {orders.slice(0, 8).map((order) => {
            const checked = selectedOrderIds.includes(order.id);
            return (
              <Pressable key={order.id} style={styles.orderRow} onPress={() => toggleOrder(order.id)}>
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.orderLabel}>{order.customer?.name ?? 'Order'}</Text>
              </Pressable>
            );
          })}
          {orders.length === 0 && <Text style={styles.emptyOrders}>No orders to link yet.</Text>}
        </View>

        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          multiline
          style={styles.notesInput}
        />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerBtn}>
          <Button label="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.footerBtn}>
          <Button label="Save Expense" onPress={onSave} loading={submitting} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.lg },
  label: { fontSize: fontSize.small, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  orderList: { backgroundColor: colors.surfaceMuted, borderRadius: radius.lg, paddingVertical: spacing.xs, marginBottom: spacing.lg },
  orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { fontSize: fontSize.caption, color: colors.secondary, fontWeight: '700' },
  orderLabel: { fontSize: fontSize.small, color: colors.text, flex: 1 },
  emptyOrders: { fontSize: fontSize.small, color: colors.textTertiary, padding: spacing.md },
  notesInput: { height: 80, textAlignVertical: 'top', paddingTop: spacing.sm },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerBtn: { flex: 1 },
});
