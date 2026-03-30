import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Expense } from 'src/modules/expenses/entities/expense.entity';
import { Purchase } from 'src/modules/purchase/entities/purchase.entity';
import { Sale } from 'src/modules/sales/entities/sale.entity';
import { User } from '../../users/entities/user.entity';

export enum MissionStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string; // ex: Achat riz 20 mars

  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

  @Column({ name: 'initial_cash', type: 'decimal', precision: 14, scale: 2 })
  initialCash: number;

  @Column({ name: 'status', type: 'varchar', default: MissionStatus.ONGOING })
  status: MissionStatus;

  @OneToMany('Purchase', 'mission')
  purchases: Purchase[];

  @OneToMany('Sale', 'mission')
  sales: Sale[];

  @OneToMany('Expense', 'mission')
  expenses: Expense[];

  @CreateDateColumn()
  createdAt: Date;
}
