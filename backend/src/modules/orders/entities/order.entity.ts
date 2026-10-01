import { OrderStatus, PaymentStatus } from '@queenscut/shared';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.orders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Column({ name: 'delivery_date', type: 'date' })
  deliveryDate: string;

  @Column({ name: 'advance_received', type: 'numeric', precision: 10, scale: 2, default: 0 })
  advanceReceived: number;

  @Column({ name: 'balance_due', type: 'numeric', precision: 10, scale: 2, default: 0 })
  balanceDue: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Index()
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Index()
  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @ManyToMany(() => Expense, (expense) => expense.orders)
  expenses?: Expense[];
}
