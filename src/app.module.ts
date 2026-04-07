import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { Customer } from './modules/customers/entities/customer.entity';
import { ExpenseCategory } from './modules/expense-category/entities/expense-category.entity';
import { ExpenseCategoryModule } from './modules/expense-category/expense-category.module';
import { Expense } from './modules/expenses/entities/expense.entity';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { Mission } from './modules/mission/entities/mission.entity';
import { MissionModule } from './modules/mission/mission.module';
import { PaymentMethod } from './modules/payment-methods/entities/payment-method.entity';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { ProductUnit } from './modules/product-units/entities/product-unit.entity';
import { ProductUnitsModule } from './modules/product-units/product-units.module';
import { Product } from './modules/products/entities/product.entity';
import { ProductsModule } from './modules/products/products.module';
import { PurchaseItem } from './modules/purchase-item/entities/purchase-item.entity';
import { PurchaseItemModule } from './modules/purchase-item/purchase-item.module';
import { Purchase } from './modules/purchase/entities/purchase.entity';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { SaleItem } from './modules/sale-items/entities/sale-item.entity';
import { SaleItemsModule } from './modules/sale-items/sale-items.module';
import { SalePayment } from './modules/sale-payments/entities/sale-payment.entity';
import { SalePaymentsModule } from './modules/sale-payments/sale-payments.module';
import { Sale } from './modules/sales/entities/sale.entity';
import { SalesModule } from './modules/sales/sales.module';
import { StockMovement } from './modules/stock-movements/entities/stock-movement.entity';
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module';
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
          Sale,
          SaleItem,
          PaymentMethod,
          SalePayment,
          StockMovement,
          Mission,
          ExpenseCategory,
          Expense,
        ],
        synchronize:
          configService.get<boolean>('database.synchronize') ?? false,
        logging: configService.get<boolean>('database.logging') ?? false,
        autoLoadEntities: true,
      }),
    }),

    UsersModule,
    DashboardModule,
    AuthModule,
    UnitsModule,
    ProductsModule,
    ProductUnitsModule,
    SuppliersModule,
    CustomersModule,
    PurchaseModule,
    PurchaseItemModule,
    SalesModule,
    SaleItemsModule,
    PaymentMethodsModule,
    SalePaymentsModule,
    StockMovementsModule,
    MissionModule,
    ExpenseCategoryModule,
    ExpensesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
