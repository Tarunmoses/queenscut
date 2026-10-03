import { useNavigation } from '@react-navigation/native';
import { InventoryItem, Order, shortOrderId } from '@queenscut/shared';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../api/client';
import { Button } from '../components/Button';
import { OrderSearchPicker } from '../components/OrderSearchPicker';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { SelectField } from '../components/SelectField';
import { TextField } from '../components/TextField';
import { colors, fontSize, radius, spacing } from '../theme';

const MODES = ['Inventory', 'Consumable', 'Other'];

function currency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function AddExpenseScreen() {
  const navigation = useNavigation<any>();
  const [mode, setMode] = useState(MODES[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Consumable / Other
  const [description, setDescription] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [linkedOrderIds, setLinkedOrderIds] = useState<string[]>([]);
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);

  // Inventory
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [suborder, setSuborder] = useState<{ orderId: string; orderItemId: string; label: string } | null>(null);
  const [suborderPickerOpen, setSuborderPickerOpen] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState(false);
  const [overrideValue, setOverrideValue] = useState('');

  useEffect(() => {
    api.get<Order[]>('/orders').then(setOrders).catch(() => setOrders([]));
    api.get<InventoryItem[]>('/inventory').then(setInventory).catch(() => setInventory([]));
  }, []);

  const selectedItem = inventory.find((i) => i.itemName === itemName);
  const autoAmount = useMemo(
    () => (selectedItem ? (Number(quantity) || 0) * Number(selectedItem.costPerUnit) : 0),
    [selectedItem, quantity],
  );
  const displayAmount = overrideAmount ? overrideValue : String(autoAmount);

  const linkedOrders = orders.filter((o) => linkedOrderIds.includes(o.id));

  const resetForm = () => {
    setDescription('');
    setManualAmount('');
    setLinkedOrderIds([]);
    setItemName('');
    setQuantity('');
    setSuborder(null);
    setOverrideAmount(false);
    setOverrideValue('');
  };

  const onSaveInventory = async () => {
    if (!selectedItem || !quantity || !suborder) {
      Alert.alert('Missing details', 'Pick an inventory item, quantity, and an order/item it was used for.');
      return;
    }
    const amount = overrideAmount ? Number(overrideValue) : autoAmount;
    setSubmitting(true);
    try {
      await api.post('/expenses', {
        description: `${selectedItem.itemName} used — ${suborder.label}`,
        amount,
        date,
        usageLines: [
          {
            inventoryItemId: selectedItem.id,
            orderId: suborder.orderId,
            orderItemId: suborder.orderItemId,
            quantity: Number(quantity),
          },
        ],
      });
      resetForm();
      navigation.goBack();
    } catch (e) {
      Alert.alert('Couldn’t save', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveSimple = async () => {
    if (!description || !manualAmount) {
      Alert.alert('Missing details', 'Description and amount are required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/expenses', {
        description,
        amount: Number(manualAmount),
        date,
        category: mode === 'Consumable' ? 'Consumable' : undefined,
        orderIds: linkedOrderIds.length ? linkedOrderIds : undefined,
      });
      resetForm();
      navigation.goBack();
    } catch (e) {
      Alert.alert('Couldn’t save', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Add Expense" dismiss="back" />
      <SegmentedTabs options={MODES} value={mode} onChange={setMode} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {mode === 'Inventory' ? (
          <>
            <SelectField
              label="Inventory Item *"
              value={itemName}
              onChange={(v) => {
                setItemName(v);
                setOverrideAmount(false);
              }}
              options={inventory.map((i) => i.itemName)}
              placeholder="Select item"
            />
            <TextField
              label={selectedItem ? `Quantity (${selectedItem.unitType}) *` : 'Quantity *'}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="e.g., 2"
              keyboardType="numeric"
            />

            <Text style={styles.sectionTitle}>Used For</Text>
            <Pressable style={styles.linkButton} onPress={() => setSuborderPickerOpen(true)}>
              <Text style={styles.linkButtonLabel}>
                {suborder ? `✓ ${suborder.label}` : '🔍 Select order & item'}
              </Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Amount (₹)</Text>
            <View style={styles.amountRow}>
              <TextField
                value={displayAmount}
                onChangeText={setOverrideValue}
                editable={overrideAmount}
                keyboardType="numeric"
                style={[styles.amountInput, !overrideAmount && styles.amountInputReadonly]}
              />
            </View>
            <Pressable
              style={styles.overrideRow}
              onPress={() => {
                setOverrideValue(overrideAmount ? overrideValue : String(autoAmount));
                setOverrideAmount((v) => !v);
              }}
            >
              <View style={[styles.checkbox, overrideAmount && styles.checkboxChecked]}>
                {overrideAmount && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.overrideLabel}>Override amount</Text>
            </Pressable>

            <TextField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          </>
        ) : (
          <>
            <TextField
              label="Description *"
              value={description}
              onChangeText={setDescription}
              placeholder={mode === 'Consumable' ? 'e.g., Buttons, zippers' : 'e.g., Fuel, Transport'}
            />
            <TextField label="Amount (₹) *" value={manualAmount} onChangeText={setManualAmount} placeholder="500" keyboardType="numeric" />
            <TextField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

            <Text style={styles.sectionTitle}>Link to Orders (Optional)</Text>
            <View style={styles.chipRow}>
              {linkedOrders.map((o) => (
                <View key={o.id} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {shortOrderId(o.id)} · {o.customer?.name}
                  </Text>
                </View>
              ))}
            </View>
            <Pressable style={styles.linkButton} onPress={() => setLinkPickerOpen(true)}>
              <Text style={styles.linkButtonLabel}>🔍 Search / Link Orders</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerBtn}>
          <Button label="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.footerBtn}>
          <Button
            label="Save Expense"
            onPress={mode === 'Inventory' ? onSaveInventory : onSaveSimple}
            loading={submitting}
          />
        </View>
      </View>

      <OrderSearchPicker
        visible={linkPickerOpen}
        orders={orders}
        mode="linkOrders"
        initialSelectedOrderIds={linkedOrderIds}
        onClose={() => setLinkPickerOpen(false)}
        onConfirmLinks={setLinkedOrderIds}
      />
      <OrderSearchPicker
        visible={suborderPickerOpen}
        orders={orders}
        mode="pickSuborder"
        onClose={() => setSuborderPickerOpen(false)}
        onPickSuborder={(orderId, orderItemId, label) => {
          setSuborder({ orderId, orderItemId, label });
          setSuborderPickerOpen(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.lg },
  sectionTitle: { fontSize: fontSize.small, fontWeight: '600', color: colors.text, marginTop: spacing.sm, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chip: { backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  chipText: { fontSize: fontSize.caption, color: colors.text, fontWeight: '600' },
  linkButton: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  linkButtonLabel: { fontSize: fontSize.body, fontWeight: '600', color: colors.secondary },
  amountRow: { marginBottom: spacing.xs },
  amountInput: { fontSize: fontSize.title, fontWeight: '700', color: colors.secondary },
  amountInputReadonly: { backgroundColor: colors.surfaceMuted, color: colors.textSecondary },
  overrideRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { fontSize: fontSize.caption, color: colors.secondary, fontWeight: '700' },
  overrideLabel: { fontSize: fontSize.small, color: colors.textSecondary },
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
