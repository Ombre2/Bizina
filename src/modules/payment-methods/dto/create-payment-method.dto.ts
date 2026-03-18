import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({
    description: 'Nom du mode de paiement',
    example: 'Cash',
  })
  @IsString({
    message: 'Le nom du mode de paiement doit être une chaîne de caractères',
  })
  @IsNotEmpty({ message: 'Le nom du mode de paiement est obligatoire' })
  @MinLength(2, {
    message: 'Le nom du mode de paiement doit contenir au moins 2 caractères',
  })
  @MaxLength(100, {
    message: 'Le nom du mode de paiement ne doit pas dépasser 100 caractères',
  })
  name: string;
}
