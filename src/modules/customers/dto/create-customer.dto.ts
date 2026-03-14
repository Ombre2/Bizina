import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Nom du client',
    example: 'Client Andafy',
  })
  @IsString({ message: 'Le nom du client doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom du client est obligatoire' })
  @MinLength(2, {
    message: 'Le nom du client doit contenir au moins 2 caractères',
  })
  @MaxLength(150, {
    message: 'Le nom du client ne doit pas dépasser 150 caractères',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone du client',
    example: '+261340000000',
  })
  @IsOptional()
  @IsString({
    message: 'Le téléphone du client doit être une chaîne de caractères',
  })
  @MaxLength(30, {
    message: 'Le téléphone du client ne doit pas dépasser 30 caractères',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Adresse du client',
    example: 'Lot II M 123, Antananarivo, Madagascar',
  })
  @IsOptional()
  @IsString({
    message: "L'adresse du client doit être une chaîne de caractères",
  })
  @MaxLength(2000, {
    message: "L'adresse du client ne doit pas dépasser 2000 caractères",
  })
  address?: string;
}
