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
    userId: string,
    username: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub: userId, username };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { sub: userId, username, type: 'refresh' },
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

    const tokens = await this.generateTokens(user.id, user.username);
    return { ...tokens, user };
  }

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return this.generateTokens(user.id, user.username);
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    let payload: { sub: string; username: string; type: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        username: string;
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

    return this.generateTokens(user.id, user.username);
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }
}
