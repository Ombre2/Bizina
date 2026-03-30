import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExpenseCategoryDto {
  @ApiProperty({
    description: 'Nom de la catégorie de dépense',
    example: 'Transport',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MaxLength(150, { message: 'Le nom ne doit pas dépasser 150 caractères' })
  name: string;

  @ApiPropertyOptional({
    description: 'Description de la catégorie',
    example: 'Dépenses liées aux déplacements',
  })
  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @MaxLength(255, {
    message: 'La description ne doit pas dépasser 30 caractères',
  })
  description?: string;
}
