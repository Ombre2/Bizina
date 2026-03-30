import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { ExpenseCategory } from './entities/expense-category.entity';

@Injectable()
export class ExpenseCategoryService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private readonly expenseCategoryRepository: Repository<ExpenseCategory>,
  ) {}

  create(createExpenseCategoryDto: CreateExpenseCategoryDto) {
    const expenseCategory = this.expenseCategoryRepository.create(
      createExpenseCategoryDto,
    );
    return this.expenseCategoryRepository.save(expenseCategory);
  }

  findAll() {
    return this.expenseCategoryRepository.find();
  }
}
