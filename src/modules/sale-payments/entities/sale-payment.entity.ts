import { PaymentMethod } from 'src/modules/payment-methods/entities/payment-method.entity';
import { Sale } from 'src/modules/sales/entities/sale.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sale_payments')
export class SalePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @ManyToOne(() => PaymentMethod, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: false,
  })
  amount: string;

  @CreateDateColumn({ name: 'payment_date', type: 'timestamp' })
  paymentDate: Date;
}
