import { useNavigation } from '@react-navigation/native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StepProgress } from '../../components/StepProgress';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { useCreateOrder } from './CreateOrderContext';

function currency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function CreateOrderStep2Screen() {
  const navigation = useNavigation<any>();
  const { draft, removeItem, totalAmount } = useCreateOrder();

  const onContinue = () => {
    if (draft.items.length === 0) {
      Alert.alert('No items yet', 'Add at least one item before continuing.');
      return;
    }
    navigation.navigate('CreateOrderReview');
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Order Items" dismiss="back" />
      <StepProgress step={2} total={3} label="Items" />
      <View style={styles.contextStrip}>
        <Text style={styles.customerName}>{draft.customerName}</Text>
        <Text style={styles.deliveryMeta}>Delivery • {draft.deliveryDate}</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ITEMS</Text>
          <Text style={styles.sectionMeta}>{draft.items.length} added</Text>
        </View>

        {draft.items.map((item, index) => (
          <Card key={index} style={styles.itemCard}>
            <View style={styles.itemTop}>
              <View style={styles.flex1}>
                <Text style={styles.itemType}>{item.apparelType}</Text>
                <Text style={styles.itemMeasurements}>
                  {Object.entries(item.measurements)
                    .filter(([, v]) => v)
                    .map(([, v]) => v)
                    .join(' · ') || 'No measurements entered'}
                </Text>
              </View>
              <Text style={styles.itemPrice}>{currency(Number(item.amountCharged) || 0)}</Text>
            </View>
            {!!item.designNotes && <Text style={styles.itemNotes}>{item.designNotes}</Text>}
            <View style={styles.itemActions}>
              <Pressable onPress={() => navigation.navigate('AddItem', { editIndex: index })}>
                <Text style={styles.editLink}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => removeItem(index)}>
                <Text style={styles.removeLink}>Remove</Text>
              </Pressable>
            </View>
          </Card>
        ))}

        <Pressable style={styles.addItemButton} onPress={() => navigation.navigate('AddItem')}>
          <Text style={styles.addItemLabel}>+ Add Item</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>ORDER TOTAL</Text>
          <Text style={styles.totalValue}>{currency(totalAmount)}</Text>
        </View>
        <View style={styles.footerButtons}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backLabel}>← Back</Text>
          </Pressable>
          <Pressable style={styles.reviewButton} onPress={onContinue}>
            <Text style={styles.reviewLabel}>Review Order →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  flex1: { flex: 1 },
  container: { flex: 1 },
  content: { padding: spacing.lg },
  contextStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  customerName: { fontSize: fontSize.body, fontWeight: '600', color: colors.text },
  deliveryMeta: { fontSize: fontSize.small, color: colors.secondary },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionMeta: { fontSize: fontSize.small, color: colors.textTertiary },
  itemCard: { marginBottom: spacing.md },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  itemType: { fontSize: fontSize.subheading, fontWeight: '600', color: colors.text },
  itemMeasurements: { fontSize: fontSize.small, color: colors.textTertiary, marginTop: 3 },
  itemPrice: { fontSize: fontSize.subheading, fontWeight: String(fontWeight.bold) as '700', color: colors.secondary },
  itemNotes: { fontSize: fontSize.small, color: colors.textSecondary, marginBottom: 10, lineHeight: 17 },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
  },
  editLink: { fontSize: fontSize.small, color: colors.primary, fontWeight: '600' },
  removeLink: { fontSize: fontSize.small, color: colors.textTertiary, fontWeight: '500' },
  addItemButton: {
    height: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemLabel: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.secondary },
  footer: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
  },
  totalLabel: { fontSize: fontSize.body, fontWeight: '600', color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  totalValue: { fontSize: fontSize.titleLg, fontWeight: String(fontWeight.bold) as '700', color: colors.text },
  footerButtons: {
    flexDirection: 'row',
    gap: 10,
    padding: spacing.md,
    paddingBottom: spacing.xl,
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
  reviewButton: {
    flex: 2,
    height: 48,
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewLabel: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.white },
});
