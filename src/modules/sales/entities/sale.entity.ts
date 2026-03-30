import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Mission } from 'src/modules/mission/entities/mission.entity';
import type { SaleItem } from 'src/modules/sale-items/entities/sale-item.entity';
import type { SalePayment } from 'src/modules/sale-payments/entities/sale-payment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
}

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

  @OneToMany('SalePayment', 'sale')
  salePayments: SalePayment[];

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
