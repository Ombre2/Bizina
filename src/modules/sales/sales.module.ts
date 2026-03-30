import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../customers/customers.module';
import { MissionModule } from '../mission/mission.module';
import { ProductUnitsModule } from '../product-units/product-units.module';
import { SaleItemsModule } from '../sale-items/sale-items.module';
import { SalePaymentsModule } from '../sale-payments/sale-payments.module';
import { StockMovementsModule } from '../stock-movements/stock-movements.module';
import { Sale } from './entities/sale.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SalesUseCaseService } from './SalesUseCaseService';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale]),
    CustomersModule,
    SaleItemsModule,
    StockMovementsModule,
    ProductUnitsModule,
    MissionModule,
    forwardRef(() => SalePaymentsModule),
  ],
  controllers: [SalesController],
  providers: [SalesService, SalesUseCaseService],
  exports: [SalesService],
})
export class SalesModule {}
