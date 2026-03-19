import { ProductUnit } from 'src/modules/product-units/entities/product-unit.entity';
import { StockMovement } from 'src/modules/stock-movements/entities/stock-movement.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @ManyToOne(() => Unit, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'base_unit_id' })
  baseUnit: Unit;

  @OneToMany(() => ProductUnit, (productUnit) => productUnit.product)
  productUnits: ProductUnit[];

  @OneToMany(() => StockMovement, (stockMovement) => stockMovement.product)
  stockMovements: StockMovement[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
