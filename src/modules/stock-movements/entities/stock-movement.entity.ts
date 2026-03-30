import { Mission } from 'src/modules/mission/entities/mission.entity';
import type { Product } from 'src/modules/products/entities/product.entity';
import { Purchase } from 'src/modules/purchase/entities/purchase.entity';
import { Sale } from 'src/modules/sales/entities/sale.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum MovementType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Product', 'stockMovements', {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 3,
    nullable: false,
  })
  quantity: string;

  @Column({
    name: 'movement_type',
    type: 'enum',
    enum: MovementType,
    nullable: false,
  })
  movementType: MovementType;

  @ManyToOne(() => Sale, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale | null;

  @Column({
    name: 'sale_id',
    type: 'varchar',
    length: 36,
    nullable: true,
    default: () => 'NULL',
  })
  saleId: string | null;

  @ManyToOne(() => Purchase, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase | null;

  @Column({
    name: 'purchase_id',
    type: 'varchar',
    length: 36,
    nullable: true,
    default: () => 'NULL',
  })
  purchaseId: string | null;

  @Column({
    name: 'mission_id',
    nullable: true,
    type: 'varchar',
    length: 36,
    default: () => 'NULL',
  })
  missionId: string;

  @ManyToOne(() => Mission, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
