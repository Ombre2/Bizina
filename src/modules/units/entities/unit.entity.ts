import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
  symbol: string;
}
