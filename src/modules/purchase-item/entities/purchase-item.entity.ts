import { ProductUnit } from 'src/modules/product-units/entities/product-unit.entity';
import { Purchase } from 'src/modules/purchase/entities/purchase.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Purchase, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;

  @ManyToOne(() => ProductUnit, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_unit_id' })
  productUnit: ProductUnit;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 3,
    nullable: false,
  })
  quantity: string;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: false,
  })
  unitPrice: string;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: false,
  })
  totalPrice: string;
}
