import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
    default: () => 'NULL',
  })
  phone?: string | null;

  @Column({
    type: 'text',
    nullable: true,
    default: () => 'NULL',
  })
  address?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
