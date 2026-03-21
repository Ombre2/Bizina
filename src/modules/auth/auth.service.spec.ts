import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcryptjs from 'bcryptjs';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcryptjs');
const mockedBcryptjs = jest.mocked(bcryptjs);

const mockUser: User = {
  id: 'user-1',
  username: 'admin',
  email: 'admin@test.com',
  password: 'hashed_pw',
  role: UserRole.ADMIN,
  isActive: true,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'findByUsername' | 'findByEmail' | 'findOne' | 'create'>
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            findByEmail: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      mockedBcryptjs.hash.mockResolvedValue('hashed_pw' as never);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        username: 'admin',
        email: 'admin@test.com',
        password: 'pass',
      });

      expect(result.access_token).toBe('jwt-token');
      expect(result.user).toEqual(mockUser);
    });

    it('should throw ConflictException if username exists', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);

      await expect(
        service.register({ username: 'admin', password: 'pass' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if email exists', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          username: 'new',
          email: 'admin@test.com',
          password: 'pass',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register without email (skip email check)', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      mockedBcryptjs.hash.mockResolvedValue('hashed_pw' as never);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        username: 'newuser',
        password: 'pass',
      });

      expect(result.access_token).toBe('jwt-token');
      expect(usersService.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should return a token for valid credentials', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);
      mockedBcryptjs.compare.mockResolvedValue(true as never);

      const result = await service.signIn('admin', 'pass');
      expect(result.access_token).toBe('jwt-token');
    });

    it('should throw UnauthorizedException for unknown user', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(service.signIn('nope', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);
      mockedBcryptjs.compare.mockResolvedValue(false as never);

      await expect(service.signIn('admin', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      const result = await service.getProfile('user-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      usersService.findOne.mockResolvedValue(null);
      await expect(service.getProfile('nope')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
