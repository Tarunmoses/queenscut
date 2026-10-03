import { useState } from 'react';
import { KeyboardTypeOptions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { ScreenHeader } from './ScreenHeader';
import { TextField } from './TextField';
import { colors, spacing } from '../theme';

interface PromptModalProps {
  visible: boolean;
  title: string;
  label: string;
  initialValue: string;
  keyboardType?: KeyboardTypeOptions;
  onSave: (value: string) => void;
  onClose: () => void;
}

/** Single-field edit — explicit Save, nothing commits on every keystroke. */
export function PromptModal({ visible, title, label, initialValue, keyboardType, onSave, onClose }: PromptModalProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onShow={() => setValue(initialValue)}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <ScreenHeader title={title} dismiss="close" />
          <View style={styles.content}>
            <TextField label={label} value={value} onChangeText={setValue} keyboardType={keyboardType} autoFocus />
          </View>
          <View style={styles.footer}>
            <Button
              label="Save"
              onPress={() => {
                onSave(value);
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
  sheet: { backgroundColor: colors.background },
  content: { padding: spacing.lg },
  footer: { padding: spacing.lg, paddingTop: 0, borderTopWidth: 0 },
});
