import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Mission } from '../mission/entities/mission.entity';
import { Product } from '../products/entities/product.entity';
import { Purchase } from '../purchase/entities/purchase.entity';
import { Sale } from '../sales/entities/sale.entity';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      Purchase,
      Expense,
      Product,
      Customer,
      Mission,
      StockMovement,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
