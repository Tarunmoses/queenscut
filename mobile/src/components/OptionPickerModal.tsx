import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { ScreenHeader } from './ScreenHeader';
import { colors, fontSize, radius, spacing } from '../theme';

interface Option {
  value: string;
  label: string;
}

interface OptionPickerModalProps {
  visible: boolean;
  title: string;
  options: Option[];
  currentValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

/** Explicit pick-then-save modal — nothing commits until "Save" is pressed. */
export function OptionPickerModal({ visible, title, options, currentValue, onSave, onClose }: OptionPickerModalProps) {
  const [selected, setSelected] = useState(currentValue);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onShow={() => setSelected(currentValue)}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <ScreenHeader title={title} dismiss="close" />
          <View style={styles.options}>
            {options.map((option) => {
              const isSelected = option.value === selected;
              return (
                <Pressable key={option.value} style={styles.row} onPress={() => setSelected(option.value)}>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.rowLabel}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.footer}>
            <Button
              label="Save"
              onPress={() => {
                onSave(selected);
                onClose();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.background, maxHeight: '70%' },
  options: { padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.secondary },
  radioDot: { width: 12, height: 12, borderRadius: radius.full, backgroundColor: colors.secondary },
  rowLabel: { fontSize: fontSize.subheading, color: colors.text },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
