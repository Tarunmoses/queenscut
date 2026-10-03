import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Order } from '@queenscut/shared';
import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { Button } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { SelectField } from '../components/SelectField';
import { TextField } from '../components/TextField';
import { APPAREL_TYPES, LOWER_BODY_FIELDS, UPPER_BODY_FIELDS } from './createOrder/measurementFields';
import { colors, fontSize, spacing } from '../theme';

export function EditMeasurementsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId, orderItemId } = route.params as { orderId: string; orderItemId: string };

  const [order, setOrder] = useState<Order | null>(null);
  const [apparelType, setApparelType] = useState('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [designNotes, setDesignNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const data = await api.get<Order>(`/orders/${orderId}`);
    setOrder(data);
    const item = data.items?.find((i) => i.id === orderItemId);
    if (item && !loaded) {
      setApparelType(item.apparelType);
      setMeasurements(
        Object.fromEntries(Object.entries(item.measurements ?? {}).map(([k, v]) => [k, String(v)])),
      );
      setDesignNotes(item.designNotes ?? '');
      setLoaded(true);
    }
  }, [orderId, orderItemId, loaded]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const setMeasurement = (key: string, value: string) => setMeasurements((m) => ({ ...m, [key]: value }));

  const onSave = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/orders/${orderId}/items/${orderItemId}`, {
        apparelType,
        measurements,
        designNotes: designNotes || undefined,
      });
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  if (!order || !loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Edit Measurements" dismiss="close" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <SelectField label="Apparel Type" value={apparelType} onChange={setApparelType} options={APPAREL_TYPES} />

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

        <TextField
          label="Design Notes"
          value={designNotes}
          onChangeText={setDesignNotes}
          placeholder="e.g., Sleeveless, gold lace trim on neckline..."
          multiline
          style={styles.notesInput}
        />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerBtn}>
          <Button label="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.footerBtn}>
          <Button label="Save Changes" onPress={onSave} loading={submitting} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.lg },
  subTitle: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  gridCell: { width: '50%', paddingHorizontal: spacing.xs },
  notesInput: { height: 76, textAlignVertical: 'top', paddingTop: spacing.sm },
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
