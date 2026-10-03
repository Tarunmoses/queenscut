import { Expense } from '@queenscut/shared';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

function currency(amount: number) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function ExpenseRow({ expense }: { expense: Expense }) {
  const usage = expense.usageLines?.[0];
  return (
    <View style={styles.row}>
      <View style={styles.flex1}>
        <Text style={styles.description}>{expense.description}</Text>
        <Text style={styles.meta}>
          {new Date(expense.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          {usage ? ` · ${usage.quantity} ${usage.inventoryItem?.unitType.toLowerCase() ?? ''}` : ''}
        </Text>
      </View>
      <Text style={styles.amount}>{currency(expense.amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  flex1: { flex: 1, paddingRight: spacing.sm },
  description: { fontSize: fontSize.body, fontWeight: '500', color: colors.text },
  meta: { fontSize: fontSize.caption, color: colors.textTertiary, marginTop: 2 },
  amount: { fontSize: fontSize.body, fontWeight: '600', color: colors.secondary },
});
