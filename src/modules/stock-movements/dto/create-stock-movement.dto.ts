import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsUUID } from 'class-validator';

export class CreateStockMovementDto {
  @ApiProperty({
    description: "Identifiant UUID de l'unité produit",
    example: '5f64f488-cc8f-4f00-a5de-1db9fc6db4a7',
  })
  @IsNotEmpty({ message: "L'identifiant de l'unité produit est obligatoire" })
  @IsUUID('4', {
    message: "L'identifiant de l'unité produit doit être un UUID valide",
  })
  productUnitId: string;

  @ApiProperty({
    description:
      'Quantité du mouvement (positive pour entrée, négative pour sortie)',
    example: '10.000',
  })
  @IsNotEmpty({ message: 'La quantité est obligatoire' })
  @IsNumberString(
    { no_symbols: false },
    { message: 'La quantité doit être un nombre valide' },
  )
  quantity: string;
}
