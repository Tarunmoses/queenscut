import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerSummary } from '@queenscut/shared';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  create(dto: CreateCustomerDto): Promise<Customer> {
    return this.customersRepository.save(this.customersRepository.create(dto));
  }

  findAll(): Promise<Customer[]> {
    return this.customersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.customersRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
  }

  /** Spend/balance are derived from orders rather than stored, so they can never drift out of sync. */
  async getSummary(id: string): Promise<CustomerSummary> {
    const customer = await this.findOne(id);
    const orders = await this.ordersRepository.find({ where: { customerId: id } });

    const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalPaid = orders.reduce((sum, o) => sum + Number(o.advanceReceived), 0);
    const pendingBalance = orders.reduce((sum, o) => sum + Number(o.balanceDue), 0);

    return {
      ...customer,
      createdAt: customer.createdAt as unknown as string,
      updatedAt: customer.updatedAt as unknown as string,
      totalSpent,
      totalPaid,
      pendingBalance,
      orderCount: orders.length,
    };
  }
}
