import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nom du produit',
    example: 'Riz importé',
  })
  @IsString({ message: 'Le nom du produit doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom du produit est obligatoire' })
  @MinLength(2, {
    message: 'Le nom du produit doit contenir au moins 2 caractères',
  })
  @MaxLength(150, {
    message: 'Le nom du produit ne doit pas dépasser 150 caractères',
  })
  name: string;

  @ApiProperty({
    description: 'Description du produit',
    example: 'Riz blanc premium conditionné en sac de 25kg.',
  })
  @IsString({
    message: 'La description du produit doit être une chaîne de caractères',
  })
  @IsNotEmpty({ message: 'La description du produit est obligatoire' })
  @MinLength(5, {
    message: 'La description du produit doit contenir au moins 5 caractères',
  })
  @MaxLength(2000, {
    message: 'La description du produit ne doit pas dépasser 2000 caractères',
  })
  description: string;

  @ApiProperty({
    description: "Identifiant UUID de l'unité de base",
    example: '9c7a4072-1315-4c53-a6f3-4202d95fb9d7',
  })
  @IsNotEmpty({ message: "L'identifiant de l'unité de base est obligatoire" })
  @IsUUID('4', {
    message: "L'identifiant de l'unité de base doit être un UUID valide",
  })
  baseUnitId: string;
}
