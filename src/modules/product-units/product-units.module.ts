import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductsModule } from '../products/products.module';
import { UnitsModule } from '../units/units.module';
import { ProductUnit } from './entities/product-unit.entity';
import { ProductUnitsController } from './product-units.controller';
import { ProductUnitsService } from './product-units.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductUnit, Product]),
    UnitsModule,
    forwardRef(() => ProductsModule),
  ],
  controllers: [ProductUnitsController],
  providers: [ProductUnitsService],
  exports: [ProductUnitsService],
})
export class ProductUnitsModule {}
