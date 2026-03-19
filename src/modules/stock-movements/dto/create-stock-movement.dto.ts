import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { MovementType } from '../entities/stock-movement.entity';

export class CreateStockMovementDto {
  @ApiProperty({
    description: 'Identifiant UUID du produit',
    example: '5f64f488-cc8f-4f00-a5de-1db9fc6db4a7',
  })
  @IsNotEmpty({ message: "L'identifiant du produit est obligatoire" })
  @IsUUID('4', {
    message: "L'identifiant du produit doit être un UUID valide",
  })
  productId: string;

  @ApiProperty({
    description: 'Quantité du mouvement',
    example: '10.000',
  })
  @IsNotEmpty({ message: 'La quantité est obligatoire' })
  @IsNumberString(
    { no_symbols: false },
    { message: 'La quantité doit être un nombre valide' },
  )
  quantity: string;

  @ApiProperty({
    description: 'Type de mouvement',
    enum: MovementType,
    example: MovementType.PURCHASE,
  })
  @IsNotEmpty({ message: 'Le type de mouvement est obligatoire' })
  @IsEnum(MovementType, {
    message: 'Le type de mouvement doit être purchase, sale ou adjustment',
  })
  movementType: MovementType;

  @ApiPropertyOptional({
    description: 'Identifiant UUID de la vente (si movement_type = sale)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID('4', {
    message: "L'identifiant de la vente doit être un UUID valide",
  })
  saleId?: string;

  @ApiPropertyOptional({
    description: "Identifiant UUID de l'achat (si movement_type = purchase)",
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID('4', {
    message: "L'identifiant de l'achat doit être un UUID valide",
  })
  purchaseId?: string;
}
