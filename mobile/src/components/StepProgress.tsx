import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

export function StepProgress({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(step / total) * 100}%` }]} />
      </View>
      <Text style={styles.label}>
        Step {step} of {total} • {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
});
