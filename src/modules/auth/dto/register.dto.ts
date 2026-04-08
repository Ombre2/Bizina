import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nom utilisateur pour la connexion',
    example: 'manager_bizina',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @ApiPropertyOptional({
    description: 'Email utilisateur (facultatif)',
    example: 'manager@bizina.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiProperty({
    description:
      'Mot de passe (min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial)',
    example: 'StrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message:
      'Le mot de passe doit contenir au moins 1 majuscule, 1 chiffre et 1 caractère spécial',
  })
  password!: string;
}
