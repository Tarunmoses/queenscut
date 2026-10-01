import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, componentSize, fontSize, radius, spacing } from '../theme';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function SelectField({ label, value, onChange, options, placeholder }: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.androidPickerWrap}>
          <Picker selectedValue={value} onValueChange={(v) => onChange(String(v))} mode="dropdown">
            <Picker.Item label={placeholder ?? 'Select...'} value="" color={colors.textTertiary} />
            {options.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={value ? styles.triggerValue : styles.triggerPlaceholder}>
          {value || placeholder || 'Select...'}
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Pressable onPress={() => setOpen(false)}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
          <Picker selectedValue={value} onValueChange={(v) => onChange(String(v))}>
            <Picker.Item label={placeholder ?? 'Select...'} value="" />
            {options.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  trigger: {
    height: componentSize.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  triggerValue: { fontSize: fontSize.bodyLg, color: colors.text },
  triggerPlaceholder: { fontSize: fontSize.bodyLg, color: colors.textTertiary },
  androidPickerWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  backdrop: { flex: 1, backgroundColor: colors.criticalBg, opacity: 0.4 },
  sheet: { backgroundColor: colors.surface },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  doneText: { color: colors.secondary, fontWeight: '600', fontSize: fontSize.bodyLg },
});
