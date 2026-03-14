import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductUnitsModule } from '../product-units/product-units.module';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SaleItemsController } from './sale-items.controller';
import { SaleItemsService } from './sale-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([SaleItem, Sale]), ProductUnitsModule],
  controllers: [SaleItemsController],
  providers: [SaleItemsService],
  exports: [SaleItemsService],
})
export class SaleItemsModule {}
