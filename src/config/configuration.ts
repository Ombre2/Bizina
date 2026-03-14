// src/config/configuration.ts

import { ProductUnit } from 'src/modules/product-units/entities/product-unit.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';
import { User } from 'src/modules/users/entities/user.entity';

export default () => ({
  port: Number(process.env.PORT ?? 3000),

  database: {
    type: process.env.DATABASE_TYPE ?? 'mysql',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 3306),
    username: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASS ?? '',
    database: process.env.DATABASE_NAME ?? 'bizina',

    synchronize: false, // Ne pas synchroniser en prod
    entities: [User, Unit, Product, ProductUnit], // Ajouter les entités ici

    logging: process.env.NODE_ENV !== 'production', // Active le logging en dev
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '3600s',
  },
});
