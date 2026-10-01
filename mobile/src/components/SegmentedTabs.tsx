import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize } from '../theme';

interface SegmentedTabsProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedTabs({ options, value, onChange }: SegmentedTabsProps) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  label: {
    fontSize: fontSize.small,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  activeLabel: {
    fontWeight: '600',
    color: colors.primary,
  },
});
