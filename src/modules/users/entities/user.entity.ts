import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsOptional } from 'class-validator';
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
  @IsOptional()
  @Column({ unique: true, nullable: true })
  email: string;

  @ApiProperty({
    description: "Nom d'utilisateur unique de l'utilisateur",
    example: 'manager_bizina',
  })
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    description: 'Mot de passe utilisateur (idéalement hashé)',
    example: '$2b$10$uD4hIhQqfM3Jk8XvM8o5mO9o6V9Z7z2Xo8L6v6u1y7nD5r3w2p1yK',
  })
  @Column()
  @Exclude()
  password: string;

  @ApiProperty({
    description: "Rôle fonctionnel de l'utilisateur",
    enum: UserRole,
    example: UserRole.CASHIER,
  })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CASHIER })
  role: UserRole;

  @ApiProperty({
    description: "Statut actif de l'utilisateur",
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Date de creation',
    type: String,
    format: 'date-time',
    example: '2026-03-12T10:00:00.000Z',
  })
  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date de derniere mise a jour',
    type: String,
    format: 'date-time',
    example: '2026-03-12T11:15:00.000Z',
  })
  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}
