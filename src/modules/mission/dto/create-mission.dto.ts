import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MissionStatus } from '../entities/mission.entity';

export class CreateMissionDto {
  @ApiProperty({
    example: 'Achat riz 20 mars',
    description: 'Titre de la mission',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '3a2e3108-5963-4d53-b808-abb32a27b18f',
    description: "UserName de l'utilisateur assigné à la mission",
  })
  @IsNotEmpty()
  userName: string; // user Name dans User

  @ApiProperty({
    example: '10000.00',
    description: 'Caisse de départ (décimal en string)',
  })
  @IsNotEmpty()
  initialCash: number;

  @ApiProperty({
    enum: MissionStatus,
    example: MissionStatus.ONGOING,
    description: 'Statut de la mission',
  })
  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus;
}
