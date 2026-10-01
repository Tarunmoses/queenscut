import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'apparel_type' })
  apparelType: string;

  @Column({ type: 'jsonb', default: {} })
  measurements: Record<string, number | string>;

  @Column({ name: 'design_notes', type: 'text', nullable: true })
  designNotes?: string;

  @Column({ name: 'amount_charged', type: 'numeric', precision: 10, scale: 2, default: 0 })
  amountCharged: number;
}
