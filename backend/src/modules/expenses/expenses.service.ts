import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InventoryService } from '../inventory/inventory.service';
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
    private readonly inventoryService: InventoryService,
  ) {}

  private async resolveOrders(orderIds?: string[]): Promise<Order[] | undefined> {
    if (!orderIds || orderIds.length === 0) return undefined;
    return this.ordersRepository.find({ where: { id: In(orderIds) } });
  }

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const { orderIds, usageLines, ...rest } = dto;

    // Orders linked via a material-usage line are implicitly linked to the
    // expense too, in addition to any explicitly chosen via orderIds.
    const allOrderIds = new Set([...(orderIds ?? []), ...(usageLines ?? []).map((u) => u.orderId)]);

    // Everything below runs in one transaction: if any usage line fails (e.g.
    // insufficient stock), the whole expense is rolled back instead of being
    // left as an orphaned row with no matching stock deduction.
    return this.expensesRepository.manager.transaction(async (manager) => {
      const expenseRepo = manager.getRepository(Expense);
      const ordersRepo = manager.getRepository(Order);

      const orders = allOrderIds.size
        ? await ordersRepo.find({ where: { id: In([...allOrderIds]) } })
        : undefined;

      const expense = expenseRepo.create({ ...rest, orders });
      const saved = await expenseRepo.save(expense);

      if (usageLines?.length) {
        saved.usageLines = [];
        // Sequential, not Promise.all: avoids two lines for the same item
        // racing on the same stock-quantity read-then-write.
        for (const line of usageLines) {
          saved.usageLines.push(
            await this.inventoryService.recordUsage({ ...line, expenseId: saved.id }, manager),
          );
        }
      }

      return saved;
    });
  }

  findAll(): Promise<Expense[]> {
    return this.expensesRepository.find({
      relations: ['orders', 'usageLines', 'usageLines.inventoryItem'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
      relations: ['orders', 'usageLines', 'usageLines.inventoryItem'],
    });
    if (!expense) {
      throw new NotFoundException(`Expense ${id} not found`);
    }
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);
    const { orderIds, usageLines, ...rest } = dto;
    Object.assign(expense, rest);
    if (orderIds) {
      expense.orders = await this.resolveOrders(orderIds);
    }
    // Editing usage lines after creation (re-adjusting stock already consumed)
    // isn't supported yet — usageLines can only be set at creation time.
    return this.expensesRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id);
    await this.expensesRepository.remove(expense);
  }
}
