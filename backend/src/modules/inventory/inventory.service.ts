import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryStatus } from '@queenscut/shared';
import { Repository } from 'typeorm';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItem } from './entities/inventory-item.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
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
}
