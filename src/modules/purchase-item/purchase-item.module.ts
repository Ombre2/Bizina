import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductUnitsModule } from '../product-units/product-units.module';
import { Purchase } from '../purchase/entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { PurchaseItemController } from './purchase-item.controller';
import { PurchaseItemService } from './purchase-item.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseItem, Purchase]),
    ProductUnitsModule,
  ],
  controllers: [PurchaseItemController],
  providers: [PurchaseItemService],
  exports: [PurchaseItemService],
})
export class PurchaseItemModule {}
