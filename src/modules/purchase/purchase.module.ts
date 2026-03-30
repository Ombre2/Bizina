import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionModule } from '../mission/mission.module';
import { PurchaseItemModule } from '../purchase-item/purchase-item.module';
import { StockMovementsModule } from '../stock-movements/stock-movements.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { Purchase } from './entities/purchase.entity';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase]),
    forwardRef(() => StockMovementsModule),
    forwardRef(() => SuppliersModule),
    forwardRef(() => PurchaseItemModule),
    MissionModule,
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
