import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('expense_categories')
export class ExpenseCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, nullable: false, unique: true })
  name: string; // transport, nourriture

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: () => 'NULL',
  })
  description?: string;
}
