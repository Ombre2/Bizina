import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsUUID } from 'class-validator';

export class CreateSaleItemDto {
  @ApiProperty({
    description: 'Identifiant UUID de la vente',
    example: '5f64f488-cc8f-4f00-a5de-1db9fc6db4a7',
  })
  @IsNotEmpty({ message: "L'identifiant de la vente est obligatoire" })
  @IsUUID('4', {
    message: "L'identifiant de la vente doit être un UUID valide",
  })
  saleId: string;

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
