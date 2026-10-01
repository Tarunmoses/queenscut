import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('expenses')
export class Expense extends BaseEntity {
  @Column()
  description: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  category?: string;

  @ManyToMany(() => Order, (order) => order.expenses)
  @JoinTable({
    name: 'expense_orders',
    joinColumn: { name: 'expense_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'order_id', referencedColumnName: 'id' },
  })
  orders?: Order[];
}
