import { useFocusEffect } from '@react-navigation/native';
import { InventoryItem } from '@queenscut/shared';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { InventoryStatusBadge } from '../components/StatusBadge';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { SelectField } from '../components/SelectField';
import { TextField } from '../components/TextField';
import { colors, fontSize, spacing } from '../theme';

const TABS = ['Stock Levels', 'Add Stock', 'History'];
const UNIT_TYPES = ['Meters', 'Spools', 'Pieces', 'Kg', 'Grams', 'Liters'];

export function InventoryScreen() {
  const [tab, setTab] = useState(TABS[0]);
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const data = await api.get<InventoryItem[]>('/inventory');
    setItems(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = (items ?? []).filter((i) =>
    i.itemName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Inventory" />
      <View style={styles.searchWrap}>
        <TextField value={search} onChangeText={setSearch} placeholder="Search items..." style={styles.searchInput} />
      </View>
      <SegmentedTabs options={TABS} value={tab} onChange={setTab} />

      {tab === 'Stock Levels' && (
        items ? (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Card style={[styles.itemCard, { borderLeftWidth: 4, borderLeftColor: leftBorderColor(item.status) }]}>
                <View style={styles.itemRow}>
                  <View>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <Text style={styles.itemMeta}>
                      {item.quantity} {item.unitType.toLowerCase()} remaining
                    </Text>
                  </View>
                  <InventoryStatusBadge status={item.status} />
                </View>
              </Card>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No inventory items yet.</Text>}
          />
        ) : (
          <View style={styles.center}>
            <ActivityIndicator color={colors.secondary} />
          </View>
        )
      )}

      {tab === 'Add Stock' && (
        <AddStockForm
          onSaved={() => {
            setTab('Stock Levels');
            load();
          }}
        />
      )}

      {tab === 'History' && (
        <View style={styles.center}>
          <Text style={styles.empty}>
            Stock movement history isn't tracked yet — this is a good next addition once stock
            adjustments need an audit trail.
          </Text>
        </View>
      )}
    </View>
  );
}

function leftBorderColor(status: InventoryItem['status']) {
  switch (status) {
    case 'critical':
      return colors.badgeUrgentBg;
    case 'low':
      return colors.badgeCautionBg;
    default:
      return colors.badgeMildBg;
  }
}

function AddStockForm({ onSaved }: { onSaved: () => void }) {
  const [itemName, setItemName] = useState('');
  const [unitType, setUnitType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSave = async () => {
    if (!itemName || !unitType || !quantity || !reorderLevel) {
      Alert.alert('Missing details', 'Item name, unit, quantity, and reorder level are required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/inventory', {
        itemName,
        unitType,
        quantity: Number(quantity),
        reorderLevel: Number(reorderLevel),
        costPerUnit: costPerUnit ? Number(costPerUnit) : 0,
      });
      onSaved();
    } catch (e) {
      Alert.alert('Couldn’t save item', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <TextField label="Item Name *" value={itemName} onChangeText={setItemName} placeholder="Select or create item" />
      <SelectField label="Unit of Measurement *" value={unitType} onChange={setUnitType} options={UNIT_TYPES} placeholder="Select unit" />
      <TextField label="Quantity *" value={quantity} onChangeText={setQuantity} placeholder="e.g., 50" keyboardType="numeric" />
      <TextField label="Reorder Level *" value={reorderLevel} onChangeText={setReorderLevel} placeholder="e.g., 5" keyboardType="numeric" />
      <TextField label="Unit Cost (Optional)" value={costPerUnit} onChangeText={setCostPerUnit} placeholder="₹/unit" keyboardType="numeric" />
      <Button label="Save Stock" onPress={onSave} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface },
  searchInput: { height: 36, fontSize: fontSize.body },
  list: { padding: spacing.md, backgroundColor: colors.background, flexGrow: 1 },
  formContainer: { padding: spacing.lg, backgroundColor: colors.background, flex: 1 },
  itemCard: { marginBottom: spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.text },
  itemMeta: { fontSize: fontSize.small, color: colors.textSecondary, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.textTertiary, padding: spacing.lg },
});
