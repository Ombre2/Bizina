import { ProductUnit } from 'src/modules/product-units/entities/product-unit.entity';
import { Sale } from 'src/modules/sales/entities/sale.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, (sale) => sale.saleItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

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
