import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodsService } from './payment-methods.service';

const mockPM: PaymentMethod = { id: 'pm-1', name: 'Cash' };

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

describe('PaymentMethodsService', () => {
  let service: PaymentMethodsService;
  let repo: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockQueryBuilder.getOne.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentMethodsService,
        {
          provide: getRepositoryToken(PaymentMethod),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            preload: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PaymentMethodsService);
    repo = module.get(getRepositoryToken(PaymentMethod));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment method', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockPM);
      repo.save.mockResolvedValue(mockPM);

      const result = await service.create({ name: 'Cash' });
      expect(result).toEqual(mockPM);
    });

    it('should throw ConflictException for duplicate name', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockPM);

      await expect(service.create({ name: 'Cash' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all payment methods', async () => {
      repo.find.mockResolvedValue([mockPM]);
      expect(await service.findAll()).toEqual([mockPM]);
    });
  });

  describe('findOne', () => {
    it('should return a payment method', async () => {
      repo.findOneBy.mockResolvedValue(mockPM);
      expect(await service.findOne('pm-1')).toEqual(mockPM);
    });

    it('should throw NotFoundException', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a payment method', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      const updated = { ...mockPM, name: 'Card' };
      repo.preload.mockResolvedValue(updated);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('pm-1', { name: 'Card' });
      expect(result.name).toBe('Card');
    });

    it('should throw ConflictException for duplicate name', async () => {
      mockQueryBuilder.getOne.mockResolvedValue({ ...mockPM, id: 'pm-2' });

      await expect(service.update('pm-1', { name: 'Cash' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      repo.preload.mockResolvedValue(undefined);

      await expect(service.update('nope', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete', async () => {
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('pm-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException', async () => {
      repo.delete.mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
