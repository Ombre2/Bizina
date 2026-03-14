import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({
    description: "Nom de l'unité",
    example: 'Kilogramme',
  })
  @IsString({ message: "Le nom de l'unité doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le nom de l'unité est obligatoire" })
  @MaxLength(100, {
    message: "Le nom de l'unité ne doit pas dépasser 100 caractères",
  })
  name: string;

  @ApiProperty({
    description: "Symbole de l'unité",
    example: 'kg',
  })
  @IsString({
    message: "Le symbole de l'unité doit être une chaîne de caractères",
  })
  @IsNotEmpty({ message: "Le symbole de l'unité est obligatoire" })
  @MaxLength(20, {
    message: "Le symbole de l'unité ne doit pas dépasser 20 caractères",
  })
  symbol: string;
}
