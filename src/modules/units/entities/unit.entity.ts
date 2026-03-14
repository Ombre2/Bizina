import type { ProductUnit } from 'src/modules/product-units/entities/product-unit.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
  symbol: string;

  @OneToMany('ProductUnit', 'unit')
  productUnits: ProductUnit[];
}
