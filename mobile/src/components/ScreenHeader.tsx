import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** "back" shows ← and pops; "close" shows ✕ and pops (modal-style flows). Omit for tab roots. */
  dismiss?: 'back' | 'close';
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, dismiss, right }: ScreenHeaderProps) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {dismiss && (
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.dismissIcon}>{dismiss === 'back' ? '←' : '✕'}</Text>
          </Pressable>
        )}
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dismissIcon: {
    fontSize: fontSize.titleLg,
    color: colors.text,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: String(fontWeight.medium) as '500',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
