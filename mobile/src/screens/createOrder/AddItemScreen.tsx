import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { colors, fontSize, radius, spacing } from '../../theme';
import { useCreateOrder } from './CreateOrderContext';
import { APPAREL_TYPES, LOWER_BODY_FIELDS, UPPER_BODY_FIELDS } from './measurementFields';

export function AddItemScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editIndex: number | undefined = route.params?.editIndex;
  const { draft, addOrUpdateItem } = useCreateOrder();
  const existing = editIndex !== undefined ? draft.items[editIndex] : undefined;

  const [apparelType, setApparelType] = useState(existing?.apparelType ?? '');
  const [measurements, setMeasurements] = useState<Record<string, string>>(existing?.measurements ?? {});
  const [designNotes, setDesignNotes] = useState(existing?.designNotes ?? '');
  const [amountCharged, setAmountCharged] = useState(existing?.amountCharged ?? '');

  const setMeasurement = (key: string, value: string) =>
    setMeasurements((m) => ({ ...m, [key]: value }));

  const onSave = () => {
    if (!apparelType || !amountCharged) {
      Alert.alert('Missing details', 'Apparel type and amount charged are required.');
      return;
    }
    addOrUpdateItem({ apparelType, measurements, designNotes, amountCharged }, editIndex);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={editIndex !== undefined ? 'Edit Item' : 'Add Item'} dismiss="close" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Item Details</Text>
        <SelectField
          label="Apparel Type *"
          value={apparelType}
          onChange={setApparelType}
          options={APPAREL_TYPES}
          placeholder="Select apparel type"
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Measurements</Text>
          <Text style={styles.sectionHint}>inches · fill what applies</Text>
        </View>

        <Text style={styles.subTitle}>Upper Body</Text>
        <View style={styles.grid}>
          {UPPER_BODY_FIELDS.map((field) => (
            <View key={field.key} style={styles.gridCell}>
              <TextField
                label={field.label}
                value={measurements[field.key] ?? ''}
                onChangeText={(v) => setMeasurement(field.key, v)}
                placeholder={field.placeholder}
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>

        <Text style={styles.subTitle}>Lower Body</Text>
        <View style={styles.grid}>
          {LOWER_BODY_FIELDS.map((field) => (
            <View key={field.key} style={styles.gridCell}>
              <TextField
                label={field.label}
                value={measurements[field.key] ?? ''}
                onChangeText={(v) => setMeasurement(field.key, v)}
                placeholder={field.placeholder}
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Design Notes</Text>
        <TextField
          value={designNotes}
          onChangeText={setDesignNotes}
          placeholder="e.g., Sleeveless, gold lace trim on neckline..."
          multiline
          style={styles.notesInput}
        />

        <Text style={styles.sectionTitle}>Price</Text>
        <TextField
          label="Amount Charged *"
          value={amountCharged}
          onChangeText={setAmountCharged}
          placeholder="2,500"
          keyboardType="numeric"
          style={styles.priceInput}
        />
        <Text style={styles.priceHint}>
          What you're charging the customer. Material and labour costs are logged later while stitching.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerBtnSmall}>
          <Button label="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.footerBtnLarge}>
          <Button label={editIndex !== undefined ? 'Save Changes' : 'Save Item'} onPress={onSave} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionHint: { fontSize: fontSize.caption, color: colors.textTertiary },
  subTitle: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  gridCell: { width: '50%', paddingHorizontal: spacing.xs },
  notesInput: { height: 76, textAlignVertical: 'top', paddingTop: spacing.sm },
  priceInput: { height: 52, fontSize: fontSize.title, fontWeight: '600', borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.background },
  priceHint: { fontSize: fontSize.small, color: colors.textTertiary, marginTop: spacing.xs, lineHeight: 17 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerBtnSmall: { flex: 1 },
  footerBtnLarge: { flex: 2 },
});
