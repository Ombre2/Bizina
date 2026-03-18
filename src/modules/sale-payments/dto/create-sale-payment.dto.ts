import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateSalePaymentDto {
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
    description: 'Identifiant UUID du mode de paiement',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty({
    message: "L'identifiant du mode de paiement est obligatoire",
  })
  @IsUUID('4', {
    message: "L'identifiant du mode de paiement doit être un UUID valide",
  })
  paymentMethodId: string;

  @ApiProperty({
    description: 'Montant du paiement',
    example: '50000.00',
  })
  @IsNotEmpty({ message: 'Le montant est obligatoire' })
  @IsNumberString(
    { no_symbols: false },
    { message: 'Le montant doit être un nombre valide' },
  )
  amount: string;

  @ApiProperty({
    description: 'Date du paiement (optionnel, par défaut maintenant)',
    example: '2026-03-18T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  paymentDate?: Date;
}
