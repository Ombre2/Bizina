import * as dotenv from 'dotenv';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import { PaymentMethod } from 'src/modules/payment-methods/entities/payment-method.entity';
import { ProductUnit } from 'src/modules/product-units/entities/product-unit.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { PurchaseItem } from 'src/modules/purchase-item/entities/purchase-item.entity';
import { Purchase } from 'src/modules/purchase/entities/purchase.entity';
import { SaleItem } from 'src/modules/sale-items/entities/sale-item.entity';
import { Sale } from 'src/modules/sales/entities/sale.entity';
import { Supplier } from 'src/modules/suppliers/entities/supplier.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';
import { User } from 'src/modules/users/entities/user.entity';
dotenv.config();

import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: (process.env.DATABASE_TYPE as 'mysql') ?? 'mysql',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 3306),
  username: process.env.DATABASE_USER ?? 'root',
  password: process.env.DATABASE_PASS ?? '',
  database: process.env.DATABASE_NAME ?? 'bizina',

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
  ],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
