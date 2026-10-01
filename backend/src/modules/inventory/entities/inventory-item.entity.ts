import { InventoryStatus } from '@queenscut/shared';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('inventory_items')
export class InventoryItem extends BaseEntity {
  @Column({ name: 'item_name' })
  itemName: string;

  @Column({ name: 'unit_type' })
  unitType: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'cost_per_unit', type: 'numeric', precision: 10, scale: 2, default: 0 })
  costPerUnit: number;

  @Column({ name: 'reorder_level', type: 'numeric', precision: 10, scale: 2, default: 0 })
  reorderLevel: number;

  @Column({ name: 'last_used_date', type: 'date', nullable: true })
  lastUsedDate?: string;

  @Index()
  @Column({ type: 'enum', enum: InventoryStatus, default: InventoryStatus.OK })
  status: InventoryStatus;
}
