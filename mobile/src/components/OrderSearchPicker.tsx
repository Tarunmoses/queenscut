import { Order, matchesOrderId, shortOrderId } from '@queenscut/shared';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { OrderStatusBadge } from './StatusBadge';
import { ScreenHeader } from './ScreenHeader';
import { TextField } from './TextField';
import { colors, fontSize, radius, spacing } from '../theme';

interface BasePickerProps {
  visible: boolean;
  orders: Order[];
  onClose: () => void;
}

interface LinkOrdersPickerProps extends BasePickerProps {
  mode: 'linkOrders';
  initialSelectedOrderIds?: string[];
  onConfirmLinks: (orderIds: string[]) => void;
}

interface PickSuborderPickerProps extends BasePickerProps {
  mode: 'pickSuborder';
  onPickSuborder: (orderId: string, orderItemId: string, label: string) => void;
}

type OrderSearchPickerProps = LinkOrdersPickerProps | PickSuborderPickerProps;

function matchesSearch(order: Order, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return matchesOrderId(order.id, query) || (order.customer?.name ?? '').toLowerCase().includes(q);
}

export function OrderSearchPicker(props: OrderSearchPickerProps) {
  const { visible, orders, onClose, mode } = props;
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>(
    mode === 'linkOrders' ? (props.initialSelectedOrderIds ?? []) : [],
  );

  const filtered = useMemo(
    () => orders.filter((o) => matchesSearch(o, search)),
    [orders, search],
  );

  const toggleOrder = (orderId: string) =>
    setSelected((ids) => (ids.includes(orderId) ? ids.filter((id) => id !== orderId) : [...ids, orderId]));

  const onDone = () => {
    if (mode === 'linkOrders') props.onConfirmLinks(selected);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.flex}>
        <ScreenHeader
          title={mode === 'linkOrders' ? 'Link Orders' : 'Pick an Item'}
          dismiss="close"
        />
        <View style={styles.searchWrap}>
          <TextField
            value={search}
            onChangeText={setSearch}
            placeholder="Search by order ID or customer..."
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(order) => order.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: order }) => {
            const isSelected = mode === 'linkOrders' && selected.includes(order.id);
            return (
              <View style={styles.orderCard}>
                <Pressable
                  style={styles.orderHeader}
                  onPress={mode === 'linkOrders' ? () => toggleOrder(order.id) : undefined}
                >
                  {mode === 'linkOrders' && (
                    <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  )}
                  <View style={styles.flex1}>
                    <Text style={styles.orderIdText}>{shortOrderId(order.id)}</Text>
                    <Text style={styles.customerName}>{order.customer?.name ?? 'Unknown customer'}</Text>
                  </View>
                  <OrderStatusBadge status={order.status} />
                </Pressable>

                <View style={styles.itemsList}>
                  {(order.items ?? []).map((item) =>
                    mode === 'pickSuborder' ? (
                      <Pressable
                        key={item.id}
                        style={styles.itemRow}
                        onPress={() =>
                          props.onPickSuborder(order.id, item.id, `${shortOrderId(order.id)} · ${item.apparelType}`)
                        }
                      >
                        <Text style={styles.itemLabel}>{item.apparelType}</Text>
                        <Text style={styles.itemChevron}>›</Text>
                      </Pressable>
                    ) : (
                      <View key={item.id} style={styles.itemRowReadOnly}>
                        <Text style={styles.itemLabel}>{item.apparelType}</Text>
                      </View>
                    ),
                  )}
                  {(order.items ?? []).length === 0 && (
                    <Text style={styles.noItems}>No items on this order.</Text>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No orders match your search.</Text>}
        />

        {mode === 'linkOrders' && (
          <View style={styles.footer}>
            <Button label={`Done (${selected.length} linked)`} onPress={onDone} />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  flex1: { flex: 1 },
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface },
  searchInput: { height: 40, fontSize: fontSize.bodyLg },
  list: { padding: spacing.md },
  orderCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { fontSize: fontSize.small, color: colors.secondary, fontWeight: '700' },
  orderIdText: { fontSize: fontSize.caption, color: colors.textTertiary, fontWeight: '600' },
  customerName: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.text, marginTop: 1 },
  itemsList: { borderTopWidth: 1, borderTopColor: colors.surfaceAlt },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.xl + spacing.sm,
  },
  itemRowReadOnly: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.xl + spacing.sm,
  },
  itemLabel: { fontSize: fontSize.small, color: colors.textSecondary },
  itemChevron: { fontSize: fontSize.subheading, color: colors.textTertiary },
  noItems: { fontSize: fontSize.small, color: colors.textTertiary, padding: spacing.md },
  empty: { textAlign: 'center', color: colors.textTertiary, marginTop: spacing.xl },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
