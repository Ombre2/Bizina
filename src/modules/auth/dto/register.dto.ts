import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nom utilisateur pour la connexion',
    example: 'manager_bizina',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({
    description: 'Email utilisateur (facultatif)',
    example: 'manager@bizina.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiProperty({
    description: 'Mot de passe utilisateur',
    example: 'StrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
