import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryStatus } from '@queenscut/shared';
import { EntityManager, Repository } from 'typeorm';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryUsage } from './entities/inventory-usage.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryUsage)
    private readonly usageRepository: Repository<InventoryUsage>,
  ) {}

  private deriveStatus(quantity: number, reorderLevel: number): InventoryStatus {
    if (quantity <= 0) return InventoryStatus.CRITICAL;
    if (quantity <= reorderLevel) return InventoryStatus.LOW;
    return InventoryStatus.OK;
  }

  create(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    const item = this.inventoryRepository.create({
      ...dto,
      status: dto.status ?? this.deriveStatus(dto.quantity, dto.reorderLevel),
    });
    return this.inventoryRepository.save(item);
  }

  findAll(): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({ order: { itemName: 'ASC' } });
  }

  async findOne(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Inventory item ${id} not found`);
    }
    return item;
  }

  async update(id: string, dto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    if (dto.quantity !== undefined && !dto.status) {
      item.status = this.deriveStatus(Number(item.quantity), Number(item.reorderLevel));
    }
    return this.inventoryRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.inventoryRepository.remove(item);
  }

  /**
   * Decrements stock for a consumption event and persists the usage row with
   * cost snapshotted. Pass `manager` (an active transaction's EntityManager)
   * so this participates in the caller's transaction instead of committing
   * independently — ExpensesService.create() relies on this so a failed
   * usage line (e.g. insufficient stock) rolls back the whole expense too,
   * rather than leaving an orphaned expense row with no matching usage.
   */
  async recordUsage(
    input: {
      inventoryItemId: string;
      orderId: string;
      orderItemId: string;
      quantity: number;
      expenseId?: string;
    },
    manager?: EntityManager,
  ): Promise<InventoryUsage> {
    const itemRepo = manager ? manager.getRepository(InventoryItem) : this.inventoryRepository;
    const usageRepo = manager ? manager.getRepository(InventoryUsage) : this.usageRepository;

    const item = await itemRepo.findOne({ where: { id: input.inventoryItemId } });
    if (!item) {
      throw new NotFoundException(`Inventory item ${input.inventoryItemId} not found`);
    }
    const quantity = Number(input.quantity);
    if (quantity > Number(item.quantity)) {
      throw new BadRequestException(
        `Not enough ${item.itemName} in stock (have ${item.quantity} ${item.unitType}, need ${quantity})`,
      );
    }

    item.quantity = Number(item.quantity) - quantity;
    item.status = this.deriveStatus(Number(item.quantity), Number(item.reorderLevel));
    await itemRepo.save(item);

    const usage = usageRepo.create({
      inventoryItemId: input.inventoryItemId,
      orderId: input.orderId,
      orderItemId: input.orderItemId,
      quantity,
      unitCost: Number(item.costPerUnit),
      totalCost: quantity * Number(item.costPerUnit),
      expenseId: input.expenseId,
    });
    return usageRepo.save(usage);
  }

  findAllUsage(): Promise<InventoryUsage[]> {
    return this.usageRepository.find({
      relations: ['inventoryItem', 'order', 'order.customer', 'orderItem'],
      order: { createdAt: 'DESC' },
    });
  }
}
