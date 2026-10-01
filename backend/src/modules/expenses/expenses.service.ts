import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  private async resolveOrders(orderIds?: string[]): Promise<Order[] | undefined> {
    if (!orderIds || orderIds.length === 0) return undefined;
    return this.ordersRepository.find({ where: { id: In(orderIds) } });
  }

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const { orderIds, ...rest } = dto;
    const expense = this.expensesRepository.create({
      ...rest,
      orders: await this.resolveOrders(orderIds),
    });
    return this.expensesRepository.save(expense);
  }

  findAll(): Promise<Expense[]> {
    return this.expensesRepository.find({ relations: ['orders'], order: { date: 'DESC' } });
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({ where: { id }, relations: ['orders'] });
    if (!expense) {
      throw new NotFoundException(`Expense ${id} not found`);
    }
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);
    const { orderIds, ...rest } = dto;
    Object.assign(expense, rest);
    if (orderIds) {
      expense.orders = await this.resolveOrders(orderIds);
    }
    return this.expensesRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id);
    await this.expensesRepository.remove(expense);
  }
}
