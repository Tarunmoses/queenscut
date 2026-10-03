import { Expense } from '@queenscut/shared';

/** Expenses linked to this order but not tied to any specific sub-order (e.g. labor, general cost). */
export function orderLevelExpenses(expenses: Expense[], orderId: string): Expense[] {
  return expenses.filter(
    (e) => e.orders?.some((o) => o.id === orderId) && !e.usageLines?.some((u) => u.orderId === orderId),
  );
}

/** Expenses with a material-usage line tied to this specific sub-order (order item). */
export function subOrderExpenses(expenses: Expense[], orderItemId: string): Expense[] {
  return expenses.filter((e) => e.usageLines?.some((u) => u.orderItemId === orderItemId));
}
