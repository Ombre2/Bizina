import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Identifiant de la catégorie de dépense',
    example: 'b1e2c3d4-5678-1234-9abc-1234567890ab',
  })
  @IsString({ message: 'categoryId doit être une chaîne' })
  @IsNotEmpty({ message: 'categoryId est obligatoire' })
  @IsUUID('4', { message: 'La catégorie doit être un UUID valide' })
  categoryId: string;

  @ApiProperty({
    description: 'Montant de la dépense (décimal sous forme de chaîne)',
    example: '15000.50',
  })
  @IsNumberString({}, { message: 'amount doit être une chaîne numérique' })
  @IsNotEmpty({ message: 'amount est obligatoire' })
  amount: string;

  @ApiPropertyOptional({
    description: 'Note ou description de la dépense',
    example: "Déjeuner d'équipe",
  })
  @IsOptional()
  @IsString({ message: 'note doit être une chaîne' })
  note?: string;

  @ApiProperty({
    description: 'Identifiant de la mission liée à la dépense',
    example: 'a1b2c3d4-5678-1234-9abc-1234567890ab',
  })
  @IsOptional()
  @IsString({ message: 'missionId doit être une chaîne' })
  @IsUUID('4', { message: 'La mission doit être un UUID valide' })
  missionId?: string;
}
