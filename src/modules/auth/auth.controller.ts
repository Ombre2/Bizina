import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ResponseUtil } from 'src/utils/response.util';
import { JwtAuthGuard } from '../../config/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { SignInDto } from './dto/sign-in.dto';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur' })
  @ApiCreatedResponse({ description: 'Inscription reussie' })
  @ApiBadRequestResponse({ description: 'Payload invalide' })
  @ApiConflictResponse({ description: 'Username ou email deja utilise' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return ResponseUtil.success(
      result,
      'Inscription reussie',
      undefined,
      HttpStatus.CREATED,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Connexion avec username et mot de passe' })
  @ApiOkResponse({ description: 'Connexion reussie' })
  @ApiUnauthorizedResponse({ description: 'Identifiants invalides' })
  async signIn(@Body() signInDto: SignInDto) {
    const result = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );
    return ResponseUtil.success(result, 'Connexion réussie');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Profil utilisateur connecte' })
  @ApiOkResponse({ description: 'Profil retourne' })
  @ApiUnauthorizedResponse({ description: 'Token invalide ou absent' })
  async getProfile(
    @Req() req: Request & { user?: { sub: string; username: string } },
  ) {
    if (!req.user) {
      throw new HttpException('Profil indisponible', HttpStatus.UNAUTHORIZED);
    }

    const result = await this.authService.getProfile(req.user.sub);
    return ResponseUtil.success(result, 'Profil récupéré avec succès');
  }
}
