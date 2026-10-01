import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('customers')
export class Customer extends BaseEntity {
  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email?: string;

  @OneToMany(() => Order, (order) => order.customer)
  orders?: Order[];
}
