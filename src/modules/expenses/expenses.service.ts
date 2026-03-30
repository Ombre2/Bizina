import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionService } from '../mission/mission.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,

    private readonly missionService: MissionService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const { missionId } = createExpenseDto;
    if (missionId) {
      await this.missionService.findOne(missionId);
    }

    const expense = this.expenseRepository.create(createExpenseDto);
    return this.expenseRepository.save(expense);
  }

  async findAll(): Promise<Expense[]> {
    return this.expenseRepository.find();
  }

  async findByMission(missionId: string): Promise<Expense[]> {
    await this.missionService.findOne(missionId);
    return this.expenseRepository.find({ where: { missionId } });
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.preload({
      id,
      ...updateExpenseDto,
    });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return this.expenseRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const result = await this.expenseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Expense not found');
    }
  }
}
