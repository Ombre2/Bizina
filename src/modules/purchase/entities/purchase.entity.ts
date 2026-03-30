import { Mission } from 'src/modules/mission/entities/mission.entity';
import type { PurchaseItem } from 'src/modules/purchase-item/entities/purchase-item.entity';
import { Supplier } from 'src/modules/suppliers/entities/supplier.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Supplier, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany('PurchaseItem', 'purchase')
  purchaseItems: PurchaseItem[];

  @Column({ name: 'purchase_date', type: 'timestamp', nullable: false })
  purchaseDate: Date;

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
