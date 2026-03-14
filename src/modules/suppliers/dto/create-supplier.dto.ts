import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Nom du fournisseur',
    example: 'Fournisseur Andafy',
  })
  @IsString({
    message: 'Le nom du fournisseur doit être une chaîne de caractères',
  })
  @IsNotEmpty({ message: 'Le nom du fournisseur est obligatoire' })
  @MinLength(2, {
    message: 'Le nom du fournisseur doit contenir au moins 2 caractères',
  })
  @MaxLength(150, {
    message: 'Le nom du fournisseur ne doit pas dépasser 150 caractères',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone du fournisseur',
    example: '+261340000000',
  })
  @IsOptional()
  @IsString({
    message: 'Le téléphone du fournisseur doit être une chaîne de caractères',
  })
  @MaxLength(30, {
    message: 'Le téléphone du fournisseur ne doit pas dépasser 30 caractères',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Adresse du fournisseur',
    example: 'Lot II M 123, Antananarivo, Madagascar',
  })
  @IsOptional()
  @IsString({
    message: "L'adresse du fournisseur doit être une chaîne de caractères",
  })
  @MaxLength(2000, {
    message: "L'adresse du fournisseur ne doit pas dépasser 2000 caractères",
  })
  address?: string;
}
