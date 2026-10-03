export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
}

export enum InventoryStatus {
  OK = 'ok',
  LOW = 'low',
  CRITICAL = 'critical',
}

export interface Measurements {
  [key: string]: number | string | undefined;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSummary extends Customer {
  totalSpent: number;
  totalPaid: number;
  pendingBalance: number;
  orderCount: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  apparelType: string;
  measurements: Measurements;
  designNotes?: string;
  amountCharged: number;
}

export interface Order {
  id: string;
  customerId: string;
  customer?: Customer;
  items?: OrderItem[];
  deliveryDate: string;
  advanceReceived: number;
  balanceDue: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  unitType: string;
  quantity: number;
  costPerUnit: number;
  reorderLevel: number;
  lastUsedDate?: string;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  /** Write-side only: pass order ids to link when creating/updating an expense. */
  orderIds?: string[];
  /** Read-side: the hydrated orders this expense is linked to (direct link or via a usage line). */
  orders?: Order[];
  usageLines?: InventoryUsage[];
  createdAt: string;
  updatedAt: string;
}

/** A single inventory consumption event, optionally logged as part of an Expense. */
export interface InventoryUsage {
  id: string;
  inventoryItemId: string;
  inventoryItem?: InventoryItem;
  orderId: string;
  order?: Order;
  orderItemId: string;
  orderItem?: OrderItem;
  quantity: number;
  unitCost: number;
  totalCost: number;
  expenseId?: string;
  createdAt: string;
}

export interface CreateInventoryUsageInput {
  inventoryItemId: string;
  orderId: string;
  orderItemId: string;
  quantity: number;
}
