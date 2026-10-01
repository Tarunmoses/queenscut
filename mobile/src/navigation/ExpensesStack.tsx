import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { ExpensesListScreen } from '../screens/ExpensesListScreen';

export type ExpensesStackParamList = {
  ExpensesList: undefined;
  AddExpense: undefined;
};

const Stack = createNativeStackNavigator<ExpensesStackParamList>();

export function ExpensesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExpensesList" component={ExpensesListScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    </Stack.Navigator>
  );
}
