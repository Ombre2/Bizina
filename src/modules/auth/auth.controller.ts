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
  Res,
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
import type { Request, Response } from 'express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { ResponseUtil } from 'src/utils/response.util';
import { JwtAuthGuard } from '../../config/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { SignInDto } from './dto/sign-in.dto';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
};

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  // Max 5 tentatives de register par minute par IP
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur' })
  @ApiCreatedResponse({ description: 'Inscription reussie' })
  @ApiBadRequestResponse({ description: 'Payload invalide' })
  @ApiConflictResponse({ description: 'Username ou email deja utilise' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, ...result } =
      await this.authService.register(registerDto);
    res.cookie(REFRESH_COOKIE, refresh_token, COOKIE_OPTIONS);
    return ResponseUtil.success(
      result,
      'Inscription reussie',
      undefined,
      HttpStatus.CREATED,
    );
  }

  // Max 5 tentatives de connexion par minute par IP (anti brute-force)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Connexion avec username et mot de passe' })
  @ApiOkResponse({ description: 'Connexion reussie' })
  @ApiUnauthorizedResponse({ description: 'Identifiants invalides' })
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, ...result } = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );
    res.cookie(REFRESH_COOKIE, refresh_token, COOKIE_OPTIONS);
    return ResponseUtil.success(result, 'Connexion réussie');
  }

  // Renouvelle l'access_token depuis le refresh_token en cookie HttpOnly
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Renouveler le token depuis le cookie' })
  @ApiOkResponse({ description: 'Nouveau token émis' })
  @ApiUnauthorizedResponse({ description: 'Refresh token invalide ou absent' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = (req.cookies as Record<string, string>)?.[REFRESH_COOKIE];
    console.log(token);
    if (!token) {
      throw new HttpException('Refresh token absent', HttpStatus.UNAUTHORIZED);
    }
    const { refresh_token, ...result } = await this.authService.refresh(token);
    res.cookie(REFRESH_COOKIE, refresh_token, COOKIE_OPTIONS);
    return ResponseUtil.success(result, 'Token renouvelé');
  }

  // Déconnexion : vide le cookie
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiOperation({ summary: 'Déconnexion' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/auth/refresh' });
    return ResponseUtil.success(null, 'Déconnecté avec succès');
  }

  @SkipThrottle()
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
