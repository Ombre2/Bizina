import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductUnitsService } from '../product-units/product-units.service';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';
import { UnitsService } from '../units/units.service';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

const mockUnit = { id: 'unit-1', name: 'Kilogramme', symbol: 'kg' };
const mockProduct: Product = {
  id: 'prod-1',
  name: 'Rice',
  description: 'Long grain',
  baseUnit: mockUnit as any,
  productUnits: [],
  stockMovements: [],
  createdAt: new Date(),
};

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: Record<string, jest.Mock>;
  let unitsService: Record<string, jest.Mock>;
  let productUnitsService: Record<string, jest.Mock>;

  const mockStockQB = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(StockMovement),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockStockQB),
          },
        },
        {
          provide: UnitsService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: ProductUnitsService,
          useValue: { createMany: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ProductsService);
    repo = module.get(getRepositoryToken(Product));
    unitsService = module.get(UnitsService);
    productUnitsService = module.get(ProductUnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product with product units', async () => {
      unitsService.findOne.mockResolvedValue(mockUnit);
      repo.create.mockReturnValue({ ...mockProduct, id: undefined });
      repo.save.mockResolvedValue(mockProduct);
      productUnitsService.createMany.mockResolvedValue([]);
      repo.findOne.mockResolvedValue(mockProduct);

      const result = await service.create({
        name: 'Rice',
        description: 'Long grain',
        baseUnitId: 'unit-1',
        productUnit: [{ unitId: 'unit-1', conversionToBase: '1' }],
      });

      expect(result).toEqual(mockProduct);
      expect(productUnitsService.createMany).toHaveBeenCalled();
    });

    it('should add base unit to productUnit if missing', async () => {
      unitsService.findOne.mockResolvedValue(mockUnit);
      repo.create.mockReturnValue({ ...mockProduct, id: undefined });
      repo.save.mockResolvedValue(mockProduct);
      productUnitsService.createMany.mockResolvedValue([]);
      repo.findOne.mockResolvedValue(mockProduct);

      await service.create({
        name: 'Rice',
        description: 'Long grain',
        baseUnitId: 'unit-1',
        productUnit: [{ unitId: 'unit-2', conversionToBase: '50' }],
      });

      const callArgs = productUnitsService.createMany.mock.calls[0][1];
      expect(callArgs).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      repo.find.mockResolvedValue([mockProduct]);
      expect(await service.findAll()).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should return a product with relations', async () => {
      repo.findOne.mockResolvedValue(mockProduct);
      const result = await service.findOne('prod-1');
      expect(result).toEqual({ ...mockProduct });
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update product fields', async () => {
      repo.findOne.mockResolvedValue({ ...mockProduct });
      unitsService.findOne.mockResolvedValue(mockUnit);
      repo.save.mockResolvedValue({ ...mockProduct, name: 'Updated' });

      const result = await service.update('prod-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete the product', async () => {
      repo.findOne.mockResolvedValue(mockProduct);
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('prod-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(mockProduct);
      repo.delete.mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStockLevel', () => {
    it('should return stock level for a product', async () => {
      repo.findOne.mockResolvedValue(mockProduct);
      mockStockQB.getRawOne.mockResolvedValue({ total: '150.000' });

      const result = await service.getStockLevel('prod-1');
      expect(result.productId).toBe('prod-1');
      expect(result.quantity).toBe('150.000');
    });
  });
});
