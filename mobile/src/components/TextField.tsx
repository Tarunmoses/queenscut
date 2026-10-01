import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, componentSize, fontSize, radius, spacing } from '../theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
}

export function TextField({ label, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.container}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textTertiary}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    height: componentSize.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.bodyLg,
    color: colors.text,
    backgroundColor: colors.surface,
  },
});
