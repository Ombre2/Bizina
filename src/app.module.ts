import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { Customer } from './modules/customers/entities/customer.entity';
import { ProductUnit } from './modules/product-units/entities/product-unit.entity';
import { ProductUnitsModule } from './modules/product-units/product-units.module';
import { Product } from './modules/products/entities/product.entity';
import { ProductsModule } from './modules/products/products.module';
import { PurchaseItem } from './modules/purchase-item/entities/purchase-item.entity';
import { PurchaseItemModule } from './modules/purchase-item/purchase-item.module';
import { Purchase } from './modules/purchase/entities/purchase.entity';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { Supplier } from './modules/suppliers/entities/supplier.entity';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { Unit } from './modules/units/entities/unit.entity';
import { UnitsModule } from './modules/units/units.module';
import { User } from './modules/users/entities/user.entity';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),

    // ✅ TypeORM global avec injection ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: (configService.get<'mysql' | 'postgres'>('database.type') ??
          'mysql') as 'mysql', // Type strict
        host: configService.get<string>('database.host') ?? 'localhost',
        port: configService.get<number>('database.port') ?? 3306,
        username: configService.get<string>('database.username') ?? 'root',
        password: configService.get<string>('database.password') ?? '',
        database: configService.get<string>('database.database') ?? 'bizina',
        entities: [
          User,
          Unit,
          Product,
          ProductUnit,
          Supplier,
          Customer,
          Purchase,
          PurchaseItem,
        ],
        synchronize:
          configService.get<boolean>('database.synchronize') ?? false,
        logging: configService.get<boolean>('database.logging') ?? false,
        autoLoadEntities: true,
      }),
    }),

    UsersModule,
    AuthModule,
    UnitsModule,
    ProductsModule,
    ProductUnitsModule,
    SuppliersModule,
    CustomersModule,
    PurchaseModule,
    PurchaseItemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
