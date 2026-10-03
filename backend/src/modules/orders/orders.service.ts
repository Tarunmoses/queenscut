import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentStatus } from '@queenscut/shared';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
  ) {}

  private derivePaymentStatus(totalAmount: number, advanceReceived: number): PaymentStatus {
    if (advanceReceived <= 0) return PaymentStatus.UNPAID;
    if (advanceReceived >= totalAmount) return PaymentStatus.PAID;
    return PaymentStatus.PARTIALLY_PAID;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amountCharged, 0);
    const advanceReceived = dto.advanceReceived ?? 0;

    const order = this.ordersRepository.create({
      customerId: dto.customerId,
      deliveryDate: dto.deliveryDate,
      advanceReceived,
      totalAmount,
      balanceDue: totalAmount - advanceReceived,
      status: dto.status,
      paymentStatus: dto.paymentStatus ?? this.derivePaymentStatus(totalAmount, advanceReceived),
      items: dto.items.map((item) => this.orderItemsRepository.create(item)),
    });

    return this.ordersRepository.save(order);
  }

  findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['customer', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['customer', 'items'],
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // NOTE: replacing dto.items wholesale (delete + recreate) is unsafe once an
    // order item has InventoryUsage rows pointing at it (FK is ON DELETE
    // RESTRICT) — it isn't currently called by the mobile app (which edits a
    // single item via updateItem() below instead), but fix this properly
    // before wiring any UI to it.
    if (dto.items) {
      await this.orderItemsRepository.delete({ orderId: id });
      order.items = dto.items.map((item) => this.orderItemsRepository.create(item));
    }

    const { items, ...rest } = dto;
    Object.assign(order, rest);

    if (dto.items || dto.advanceReceived !== undefined) {
      this.recomputeTotals(order, { keepPaymentStatus: !!dto.paymentStatus, balanceDueOverride: dto.balanceDue });
    }

    return this.ordersRepository.save(order);
  }

  /** Edits a single order item in place (no delete/recreate), then recomputes the parent order's totals. */
  async updateItem(orderId: string, itemId: string, dto: UpdateOrderItemDto): Promise<Order> {
    const order = await this.findOne(orderId);
    const item = order.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found on order ${orderId}`);
    }

    Object.assign(item, dto);
    await this.orderItemsRepository.save(item);

    this.recomputeTotals(order, { keepPaymentStatus: false });
    return this.ordersRepository.save(order);
  }

  private recomputeTotals(
    order: Order,
    options: { keepPaymentStatus: boolean; balanceDueOverride?: number },
  ): void {
    order.totalAmount = order.items.reduce((sum, item) => sum + Number(item.amountCharged), 0);
    order.balanceDue = options.balanceDueOverride ?? order.totalAmount - Number(order.advanceReceived);
    if (!options.keepPaymentStatus) {
      order.paymentStatus = this.derivePaymentStatus(order.totalAmount, Number(order.advanceReceived));
    }
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }
}
