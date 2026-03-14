import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumberString, IsUUID } from 'class-validator';

export class CreatePurchaseDto {
  @ApiProperty({
    description: 'Identifiant UUID du fournisseur',
    example: 'f63ee3fe-2d2b-480a-8f1d-34d56d2233c9',
  })
  @IsNotEmpty({ message: 'Le fournisseur est obligatoire' })
  @IsUUID('4', { message: 'Le fournisseur doit être un UUID valide' })
  supplierId: string;

  @ApiProperty({
    description: "Date de l'achat",
    example: '2026-03-14T10:30:00.000Z',
  })
  @IsNotEmpty({ message: "La date d'achat est obligatoire" })
  @Type(() => Date)
  @IsDate({ message: "La date d'achat doit être une date valide" })
  purchaseDate: Date;

  @ApiProperty({
    description: "Montant total de l'achat",
    example: '150000.50',
  })
  @IsNotEmpty({ message: 'Le montant total est obligatoire' })
  @IsNumberString(
    { no_symbols: false },
    { message: 'Le montant total doit être un nombre valide' },
  )
  totalAmount: string;
}
