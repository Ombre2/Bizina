import { Product } from 'src/modules/products/entities/product.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('product_units')
@Unique(['product', 'unit'])
export class ProductUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Unit, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: false })
  conversionToBase: string;
}
