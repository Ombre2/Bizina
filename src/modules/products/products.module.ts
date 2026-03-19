import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductUnitsModule } from '../product-units/product-units.module';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';
import { UnitsModule } from '../units/units.module';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, StockMovement]),
    UnitsModule,
    forwardRef(() => ProductUnitsModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
