import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateSaleItemInputDto {
  @ApiProperty({
    description: "Identifiant UUID de l'unité produit",
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty({ message: "L'identifiant de l'unité produit est obligatoire" })
  @IsUUID('4', {
    message: "L'identifiant de l'unité produit doit être un UUID valide",
  })
  productUnitId: string;

  @ApiProperty({
    description: 'Quantité vendue',
    example: '12.500',
  })
  @IsNotEmpty({ message: 'La quantité est obligatoire' })
  @IsNumberString(
    { no_symbols: false },
    { message: 'La quantité doit être un nombre valide' },
  )
  quantity: string;

  @ApiProperty({
    description: 'Prix unitaire de vente',
    example: '3500.00',
  })
  @IsNotEmpty({ message: 'Le prix unitaire est obligatoire' })
  @IsNumberString(
    { no_symbols: false },
    { message: 'Le prix unitaire doit être un nombre valide' },
  )
  unitPrice: string;
}

export class CreateSaleDto {
  @ApiPropertyOptional({
    description: 'Identifiant UUID du client (optionnel)',
    example: 'f63ee3fe-2d2b-480a-8f1d-34d56d2233c9',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le client doit être un UUID valide' })
  customerId?: string;

  @ApiProperty({
    description: 'Date de la vente',
    example: '2026-03-14T10:30:00.000Z',
  })
  @IsNotEmpty({ message: 'La date de vente est obligatoire' })
  @Type(() => Date)
  @IsDate({ message: 'La date de vente doit être une date valide' })
  saleDate: Date;

  @ApiProperty({
    description: 'Lignes de vente',
    type: [CreateSaleItemInputDto],
    example: [
      {
        productUnitId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        quantity: '12.500',
        unitPrice: '3500.00',
      },
    ],
  })
  @IsArray({ message: 'items doit être un tableau' })
  @ArrayNotEmpty({ message: 'items doit contenir au moins une ligne' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemInputDto)
  items: CreateSaleItemInputDto[];
}
