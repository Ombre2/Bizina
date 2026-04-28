import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
}

@Entity('users')
export class User {
  @ApiProperty({
    description: "Identifiant unique (UUID) de l'utilisateur",
    example: '9c7a4072-1315-4c53-a6f3-4202d95fb9d7',
  })
  @Exclude()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: "Adresse email unique de l'utilisateur",
    example: 'manager@bizina.com',
  })
  // @Column({ type: 'varchar', length: 254, unique: true, nullable: true })
  // email?: string | null;
  @Column({
    type: 'varchar',
    length: 254,
    nullable: true,
    default: () => 'NULL',
    unique: true,
  })
  email: string | null;

  @ApiProperty({
    description: "Nom d'utilisateur unique de l'utilisateur",
    example: 'manager_bizina',
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  username: string;

  @ApiProperty({
    description: 'Mot de passe utilisateur (idéalement hashé)',
    example: '$2b$10$uD4hIhQqfM3Jk8XvM8o5mO9o6V9Z7z2Xo8L6v6u1y7nD5r3w2p1yK',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  @Exclude()
  password: string;

  @ApiProperty({
    description: "Rôle fonctionnel de l'utilisateur",
    enum: UserRole,
    example: UserRole.CASHIER,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CASHIER,
    nullable: false,
  })
  role: UserRole;

  @ApiProperty({
    description: "Statut actif de l'utilisateur",
    example: true,
  })
  @Column({ type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @ApiProperty({
    description: 'Date de dernière connexion',
    type: String,
    format: 'date-time',
    example: '2026-03-12T10:00:00.000Z',
  })
  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => 'NULL',
  })
  lastLogin: Date | null;

  @ApiProperty({
    description: 'Date de création de l’utilisateur',
    type: String,
    format: 'date-time',
    example: '2026-03-12T10:00:00.000Z',
  })
  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    type: String,
    format: 'date-time',
    example: '2026-03-12T11:15:00.000Z',
  })
  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}
