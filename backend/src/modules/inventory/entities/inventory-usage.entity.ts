import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { InventoryItem } from './inventory-item.entity';

@Entity('inventory_usage')
export class InventoryUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inventory_item_id' })
  inventoryItemId: string;

  @ManyToOne(() => InventoryItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'inventory_item_id' })
  inventoryItem: InventoryItem;

  @Index()
  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_item_id' })
  orderItemId: string;

  @ManyToOne(() => OrderItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity: number;

  /** Snapshot of the item's cost-per-unit at the moment of use, so later price changes don't rewrite history. */
  @Column({ name: 'unit_cost', type: 'numeric', precision: 10, scale: 2 })
  unitCost: number;

  @Column({ name: 'total_cost', type: 'numeric', precision: 10, scale: 2 })
  totalCost: number;

  @Column({ name: 'expense_id', nullable: true })
  expenseId?: string;

  @ManyToOne(() => Expense, (expense) => expense.usageLines, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'expense_id' })
  expense?: Expense;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
