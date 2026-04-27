import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateProductUnitInputDto {
  @ApiProperty({
    description: "Identifiant UUID de l'unité",
    example: '1f84ac4e-16d5-4708-bdc7-5aa0d2d8a789',
  })
  @IsNotEmpty({ message: "L'identifiant de l'unité est obligatoire" })
  @IsUUID('4', {
    message: "L'identifiant de l'unité doit être un UUID valide",
  })
  unitId: string;

  @ApiProperty({
    description: "Facteur de conversion vers l'unité de base",
    example: '0.12',
  })
  @IsNotEmpty({ message: 'La conversion vers unité de base est obligatoire' })
  @IsNumberString(
    { no_symbols: false },
    {
      message: 'La conversion vers unité de base doit être un nombre valide',
    },
  )
  conversionToBase: string;
}

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
    example: 'a5811864-7eb4-4b29-b27a-1f67ed13eb53',
  })
  @IsNotEmpty({ message: "L'identifiant de l'unité de base est obligatoire" })
  @IsUUID('4', {
    message: "L'identifiant de l'unité de base doit être un UUID valide",
  })
  baseUnitId: string;

  @ApiProperty({
    description: 'Stock minimum d\'alerte',
    example: '10',
  })
  @IsNotEmpty({ message: 'Le stock minimum est obligatoire' })
  @IsNumber({}, { message: 'Le stock minimum doit être un nombre valide' })
  minimumStock: number;

  @ApiProperty({
    description: 'Liste des unités associées au produit avec leur conversion',
    example: [
      {
        unitId: 'a5811864-7eb4-4b29-b27a-1f67ed13eb53',
        conversionToBase: '3.5',
      },
      {
        unitId: '14fe4761-55ba-4531-87df-e61133609eff',
        conversionToBase: '1',
      },
    ],
    type: [CreateProductUnitInputDto],
  })
  @IsArray({ message: 'productUnit doit être un tableau' })
  @ArrayNotEmpty({ message: 'productUnit doit contenir au moins une unité' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductUnitInputDto)
  productUnit: CreateProductUnitInputDto[];
}
