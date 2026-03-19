import { Customer } from 'src/modules/customers/entities/customer.entity';
import type { SaleItem } from 'src/modules/sale-items/entities/sale-item.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'customer_id',
    type: 'varchar',
    length: 36,
    nullable: true,
    default: () => 'NULL',
  })
  customerId: string | null;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer | null;

  @OneToMany('SaleItem', 'sale', { cascade: true })
  saleItems: SaleItem[];

  @Column({ name: 'sale_date', type: 'timestamp', nullable: false })
  saleDate: Date;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: false,
  })
  totalAmount: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
