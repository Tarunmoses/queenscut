import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentStatus } from '@queenscut/shared';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
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

    if (dto.items) {
      await this.orderItemsRepository.delete({ orderId: id });
      order.items = dto.items.map((item) => this.orderItemsRepository.create(item));
    }

    const { items, ...rest } = dto;
    Object.assign(order, rest);

    if (dto.items || dto.advanceReceived !== undefined) {
      order.totalAmount = order.items.reduce((sum, item) => sum + Number(item.amountCharged), 0);
      order.balanceDue = dto.balanceDue ?? order.totalAmount - Number(order.advanceReceived);
      if (!dto.paymentStatus) {
        order.paymentStatus = this.derivePaymentStatus(order.totalAmount, Number(order.advanceReceived));
      }
    }

    return this.ordersRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }
}
