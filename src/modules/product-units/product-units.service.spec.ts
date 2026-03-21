import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { UnitsService } from '../units/units.service';
import { ProductUnit } from './entities/product-unit.entity';
import { ProductUnitsService } from './product-units.service';

const mockUnit = { id: 'unit-1', name: 'Kilogramme', symbol: 'kg' };
const mockProduct = { id: 'prod-1', name: 'Rice' } as Product;
const mockPU: ProductUnit = {
  id: 'pu-1',
  product: mockProduct,
  unit: mockUnit as any,
  conversionToBase: '1',
};

describe('ProductUnitsService', () => {
  let service: ProductUnitsService;
  let puRepo: Record<string, jest.Mock>;
  let productRepo: Record<string, jest.Mock>;
  let unitsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductUnitsService,
        {
          provide: getRepositoryToken(ProductUnit),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: UnitsService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ProductUnitsService);
    puRepo = module.get(getRepositoryToken(ProductUnit));
    productRepo = module.get(getRepositoryToken(Product));
    unitsService = module.get(UnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product unit association', async () => {
      productRepo.findOneBy.mockResolvedValue(mockProduct);
      unitsService.findOne.mockResolvedValue(mockUnit);
      puRepo.create.mockReturnValue(mockPU);
      puRepo.save.mockResolvedValue(mockPU);

      const result = await service.create({
        productId: 'prod-1',
        unitId: 'unit-1',
        conversionToBase: '1',
      });
      expect(result).toEqual(mockPU);
    });

    it('should throw NotFoundException if product not found', async () => {
      productRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({
          productId: 'nope',
          unitId: 'unit-1',
          conversionToBase: '1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all product units', async () => {
      puRepo.find.mockResolvedValue([mockPU]);
      expect(await service.findAll()).toEqual([mockPU]);
    });
  });

  describe('findOne', () => {
    it('should return a product unit', async () => {
      puRepo.findOne.mockResolvedValue(mockPU);
      expect(await service.findOne('pu-1')).toEqual(mockPU);
    });

    it('should throw NotFoundException', async () => {
      puRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createMany', () => {
    it('should return empty array for empty items', async () => {
      productRepo.findOneBy.mockResolvedValue(mockProduct);
      expect(await service.createMany('prod-1', [])).toEqual([]);
    });

    it('should create new product units and update existing ones', async () => {
      const unit2 = { id: 'unit-2', name: 'Sac', symbol: 'sac' };
      productRepo.findOneBy.mockResolvedValue(mockProduct);
      unitsService.findOne.mockImplementation(async (id: string) =>
        id === 'unit-1' ? mockUnit : unit2,
      );
      puRepo.find
        .mockResolvedValueOnce([{ ...mockPU, unit: mockUnit }])
        .mockResolvedValueOnce([
          mockPU,
          { ...mockPU, id: 'pu-2', unit: unit2, conversionToBase: '50' },
        ]);
      puRepo.create.mockImplementation((data) => data);
      puRepo.save.mockResolvedValue([]);

      const result = await service.createMany('prod-1', [
        { unitId: 'unit-1', conversionToBase: '1' },
        { unitId: 'unit-2', conversionToBase: '50' },
      ]);

      expect(result).toHaveLength(2);
    });

    it('should deduplicate items by unitId keeping last value', async () => {
      productRepo.findOneBy.mockResolvedValue(mockProduct);
      unitsService.findOne.mockResolvedValue(mockUnit);
      puRepo.find.mockResolvedValueOnce([]).mockResolvedValueOnce([mockPU]);
      puRepo.create.mockImplementation((data) => data);
      puRepo.save.mockResolvedValue([]);

      await service.createMany('prod-1', [
        { unitId: 'unit-1', conversionToBase: '1' },
        { unitId: 'unit-1', conversionToBase: '5' },
      ]);

      expect(unitsService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if product not found', async () => {
      productRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.createMany('nope', [
          { unitId: 'unit-1', conversionToBase: '1' },
        ]),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByProductId', () => {
    it('should return a product unit by product id', async () => {
      puRepo.findOne.mockResolvedValue(mockPU);
      expect(await service.findOneByProductId('prod-1')).toEqual(mockPU);
    });

    it('should throw NotFoundException if not found', async () => {
      puRepo.findOne.mockResolvedValue(null);
      await expect(service.findOneByProductId('nope')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update conversionToBase', async () => {
      puRepo.findOne.mockResolvedValue({ ...mockPU });
      const updated = { ...mockPU, conversionToBase: '10' };
      puRepo.save.mockResolvedValue(updated);

      const result = await service.update('pu-1', { conversionToBase: '10' });
      expect(result.conversionToBase).toBe('10');
    });

    it('should update productId', async () => {
      const newProduct = { id: 'prod-2', name: 'Sugar' } as Product;
      puRepo.findOne.mockResolvedValue({ ...mockPU });
      productRepo.findOneBy.mockResolvedValue(newProduct);
      puRepo.save.mockResolvedValue({ ...mockPU, product: newProduct });

      const result = await service.update('pu-1', { productId: 'prod-2' });
      expect(result.product).toEqual(newProduct);
    });

    it('should update unitId', async () => {
      const newUnit = { id: 'unit-2', name: 'Sac', symbol: 'sac' };
      puRepo.findOne.mockResolvedValue({ ...mockPU });
      unitsService.findOne.mockResolvedValue(newUnit);
      puRepo.save.mockResolvedValue({ ...mockPU, unit: newUnit });

      const result = await service.update('pu-1', { unitId: 'unit-2' });
      expect(result.unit).toEqual(newUnit);
    });
  });

  describe('remove', () => {
    it('should delete', async () => {
      puRepo.findOne.mockResolvedValue(mockPU);
      puRepo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('pu-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException', async () => {
      puRepo.findOne.mockResolvedValue(mockPU);
      puRepo.delete.mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
