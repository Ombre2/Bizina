import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

const mockUser: User = {
  id: 'user-1',
  username: 'admin',
  email: 'admin@test.com',
  password: 'hashed',
  role: UserRole.ADMIN,
  isActive: true,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            preload: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      repo.create.mockReturnValue(mockUser);
      repo.save.mockResolvedValue(mockUser);

      const result = await service.create({
        username: 'admin',
        password: 'hashed',
      });

      expect(repo.create).toHaveBeenCalledWith({
        username: 'admin',
        password: 'hashed',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      repo.find.mockResolvedValue([mockUser]);
      expect(await service.findAll()).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      repo.findOneBy.mockResolvedValue(mockUser);
      expect(await service.findOne('user-1')).toEqual(mockUser);
    });

    it('should return null if not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      expect(await service.findOne('nope')).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      repo.findOneBy.mockResolvedValue(mockUser);
      expect(await service.findByUsername('admin')).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      repo.findOneBy.mockResolvedValue(mockUser);
      expect(await service.findByEmail('admin@test.com')).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should preload and save the user', async () => {
      const updated = { ...mockUser, username: 'new' };
      repo.preload.mockResolvedValue(updated);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('user-1', { username: 'new' });
      expect(result.username).toBe('new');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      repo.preload.mockResolvedValue(undefined);
      await expect(service.update('nope', { username: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete the user', async () => {
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('user-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if not affected', async () => {
      repo.delete.mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
