import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsUUID } from 'class-validator';

export class CreateProductUnitDto {
  @ApiProperty({
    description: 'Identifiant UUID du produit',
    example: '9c7a4072-1315-4c53-a6f3-4202d95fb9d7',
  })
  @IsNotEmpty({ message: "L'identifiant du produit est obligatoire" })
  @IsUUID('4', {
    message: "L'identifiant du produit doit être un UUID valide",
  })
  productId: string;

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
