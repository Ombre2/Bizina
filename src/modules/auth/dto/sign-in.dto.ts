import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'Nom utilisateur de connexion',
    example: 'manager_bizina',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Mot de passe de connexion',
    example: 'StrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
