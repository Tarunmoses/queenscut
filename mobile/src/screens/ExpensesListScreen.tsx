import { useNavigation } from '@react-navigation/native';
import { Expense } from '@queenscut/shared';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../api/client';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { TextField } from '../components/TextField';
import { colors, fontSize, radius, spacing } from '../theme';

function currency(amount: number) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function ExpensesListScreen() {
  const navigation = useNavigation<any>();
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const data = await api.get<Expense[]>('/expenses');
    setExpenses(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = (expenses ?? []).filter((e) =>
    e.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Expenses" />
      <View style={styles.searchWrap}>
        <TextField value={search} onChangeText={setSearch} placeholder="Search expenses..." style={styles.searchInput} />
      </View>

      {!expenses ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.row}>
              <View style={styles.rowBetween}>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.amount}>{currency(item.amount)}</Text>
              </View>
              <Text style={styles.meta}>
                {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                {item.category ? ` · ${item.category}` : ''}
              </Text>
            </Card>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No expenses logged yet.</Text>}
        />
      )}

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddExpense')}>
        <Text style={styles.fabLabel}>+ Add Expense</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface },
  searchInput: { height: 36, fontSize: fontSize.body },
  list: { padding: spacing.md, backgroundColor: colors.background, flexGrow: 1, paddingBottom: 90 },
  row: { marginBottom: spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  description: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.text },
  amount: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.secondary },
  meta: { fontSize: fontSize.small, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textTertiary, marginTop: spacing.xl },
  fab: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: { fontSize: fontSize.bodyLg, fontWeight: '600', color: colors.text },
});
