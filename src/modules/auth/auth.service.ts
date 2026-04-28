import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { StringValue } from 'ms';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async generateTokens(
    user: Pick<User, 'id' | 'username' | 'role'>,
    sessionNonce: number,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      nonce: sessionNonce,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
          expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') ??
            '7d') as StringValue,
        },
      ),
    ]);

    return { access_token, refresh_token };
  }

  async register(registerDto: RegisterDto): Promise<{
    access_token: string;
    refresh_token: string;
    user: Omit<User, 'password'>;
  }> {
    const existingUser = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUser) {
      throw new ConflictException("Ce nom d'utilisateur est déjà utilisé.");
    }

    if (registerDto.email) {
      const existingEmail = await this.usersService.findByEmail(
        registerDto.email,
      );
      if (existingEmail) {
        throw new ConflictException('Cet email est déjà utilisé.');
      }
    }

    const user = await this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: await hash(registerDto.password, 10),
    });

    const sessionNonce = await this.usersService.bumpSessionNonce(user.id);
    const tokens = await this.generateTokens(user, sessionNonce);
    return { ...tokens, user };
  }

  async signIn(
    username: string,
    pass: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    user: Omit<User, 'password'>;
  }> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const sessionNonce = await this.usersService.bumpSessionNonce(user.id);
    const tokens = await this.generateTokens(user, sessionNonce);
    return { ...tokens, user };
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    let payload: {
      sub: string;
      username: string;
      role: User['role'];
      nonce: number;
      type: string;
    };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        username: string;
        role: User['role'];
        nonce: number;
        type: string;
      }>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token de type invalide');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    const currentNonce = Math.floor((user.lastLogin?.getTime() ?? 0) / 1000);
    if (payload.nonce !== currentNonce) {
      throw new UnauthorizedException('Refresh token invalide ou revoque');
    }

    const nextNonce = await this.usersService.bumpSessionNonce(user.id);
    return this.generateTokens(user, nextNonce);
  }

  async revokeSessionFromRefreshToken(refreshToken: string): Promise<void> {
    let payload: { sub: string; type: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        type: string;
      }>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      return;
    }

    if (payload.type !== 'refresh') {
      return;
    }

    await this.usersService.bumpSessionNonce(payload.sub);
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }
}
