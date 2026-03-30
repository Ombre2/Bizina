import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategory } from './entities/expense-category.entity';
import { ExpenseCategoryController } from './expense-category.controller';
import { ExpenseCategoryService } from './expense-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseCategory])],
  controllers: [ExpenseCategoryController],
  providers: [ExpenseCategoryService],
})
export class ExpenseCategoryModule {}
