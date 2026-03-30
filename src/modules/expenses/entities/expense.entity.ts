import { ExpenseCategory } from 'src/modules/expense-category/entities/expense-category.entity';
import { Mission } from 'src/modules/mission/entities/mission.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
  })
  amount: string;

  @Column({ type: 'text', nullable: true, default: () => 'NULL' })
  note?: string;

  // 🔥 clé importante
  @Column({
    name: 'mission_id',
    type: 'varchar',
    length: 36,
    nullable: true,
    default: () => 'NULL',
  })
  missionId: string;

  @ManyToOne(() => Mission, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @ManyToOne(() => ExpenseCategory, { nullable: false, eager: true })
  @JoinColumn({ name: 'category_id' })
  category: ExpenseCategory;

  @Column({ name: 'category_id', type: 'varchar', length: 36 })
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;
}
