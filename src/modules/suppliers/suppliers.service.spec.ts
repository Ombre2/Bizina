import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { SuppliersService } from './suppliers.service';

const mockSupplier: Supplier = {
  id: 'sup-1',
  name: 'Fournisseur A',
  phone: '0698765432',
  address: '456 rue',
  createdAt: new Date(),
};

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

describe('SuppliersService', () => {
  let service: SuppliersService;
  let repo: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockQueryBuilder.getOne.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: getRepositoryToken(Supplier),
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

    service = module.get(SuppliersService);
    repo = module.get(getRepositoryToken(Supplier));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a supplier', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockSupplier);
      repo.save.mockResolvedValue(mockSupplier);

      const result = await service.create({
        name: 'Fournisseur A',
        phone: '0698765432',
      });
      expect(result).toEqual(mockSupplier);
    });

    it('should throw ConflictException on duplicate name+phone', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockSupplier);

      await expect(
        service.create({ name: 'Fournisseur A', phone: '0698765432' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should skip duplicate check when no phone', async () => {
      repo.create.mockReturnValue({ ...mockSupplier, phone: null });
      repo.save.mockResolvedValue({ ...mockSupplier, phone: null });

      const result = await service.create({ name: 'Fournisseur B' });
      expect(result).toBeDefined();
      expect(mockQueryBuilder.getOne).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all suppliers', async () => {
      repo.find.mockResolvedValue([mockSupplier]);
      expect(await service.findAll()).toEqual([mockSupplier]);
    });
  });

  describe('findOne', () => {
    it('should return a supplier', async () => {
      repo.findOneBy.mockResolvedValue(mockSupplier);
      expect(await service.findOne('sup-1')).toEqual(mockSupplier);
    });

    it('should throw NotFoundException', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the supplier', async () => {
      repo.findOneBy.mockResolvedValue(mockSupplier);
      mockQueryBuilder.getOne.mockResolvedValue(null);
      const updated = { ...mockSupplier, name: 'Updated' };
      repo.preload.mockResolvedValue(updated);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('sup-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if preload fails', async () => {
      repo.findOneBy.mockResolvedValue(mockSupplier);
      mockQueryBuilder.getOne.mockResolvedValue(null);
      repo.preload.mockResolvedValue(undefined);

      await expect(service.update('nope', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException on duplicate during update', async () => {
      repo.findOneBy.mockResolvedValue(mockSupplier);
      mockQueryBuilder.getOne.mockResolvedValue(mockSupplier);

      await expect(
        service.update('sup-1', { name: 'Duplicate', phone: '0698765432' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should skip duplicate check when phone is absent', async () => {
      const supplierNoPhone = { ...mockSupplier, phone: null };
      repo.findOneBy.mockResolvedValue(supplierNoPhone);
      const updated = { ...supplierNoPhone, name: 'New Name' };
      repo.preload.mockResolvedValue(updated);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('sup-1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
      expect(mockQueryBuilder.getOne).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete the supplier', async () => {
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('sup-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException', async () => {
      repo.delete.mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
