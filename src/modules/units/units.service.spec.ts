import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Unit } from './entities/unit.entity';
import { UnitsService } from './units.service';

const mockUnit: Unit = {
  id: 'unit-1',
  name: 'Kilogramme',
  symbol: 'kg',
  productUnits: [],
};

describe('UnitsService', () => {
  let service: UnitsService;
  let repo: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        {
          provide: getRepositoryToken(Unit),
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

    service = module.get(UnitsService);
    repo = module.get(getRepositoryToken(Unit));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a unit', async () => {
      repo.create.mockReturnValue(mockUnit);
      repo.save.mockResolvedValue(mockUnit);

      const result = await service.create({ name: 'Kilogramme', symbol: 'kg' });
      expect(result).toEqual(mockUnit);
    });
  });

  describe('findAll', () => {
    it('should return all units ordered by name', async () => {
      repo.find.mockResolvedValue([mockUnit]);
      const result = await service.findAll();
      expect(result).toEqual([mockUnit]);
      expect(repo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });
  });

  describe('findOne', () => {
    it('should return a unit', async () => {
      repo.findOneBy.mockResolvedValue(mockUnit);
      expect(await service.findOne('unit-1')).toEqual(mockUnit);
    });

    it('should throw NotFoundException', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should preload and save', async () => {
      const updated = { ...mockUnit, name: 'Litre' };
      repo.preload.mockResolvedValue(updated);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('unit-1', { name: 'Litre' });
      expect(result.name).toBe('Litre');
    });

    it('should throw NotFoundException if not found', async () => {
      repo.preload.mockResolvedValue(undefined);
      await expect(service.update('nope', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete', async () => {
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('unit-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException', async () => {
      repo.delete.mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
