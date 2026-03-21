import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductUnitsService } from '../product-units/product-units.service';
import { MovementType, StockMovement } from './entities/stock-movement.entity';
import { StockMovementsService } from './stock-movements.service';

const mockProduct = { id: 'prod-1', name: 'Rice' };
const mockProductUnit = {
  id: 'pu-1',
  product: mockProduct,
  unit: { id: 'unit-1', name: 'Sac', symbol: 'sac' },
  conversionToBase: '50',
};

const mockMovement: StockMovement = {
  id: 'sm-1',
  product: mockProduct as any,
  quantity: '100.000',
  movementType: MovementType.ADJUSTMENT,
  sale: null,
  saleId: null,
  purchase: null,
  purchaseId: null,
  createdAt: new Date(),
};

describe('StockMovementsService', () => {
  let service: StockMovementsService;
  let repo: Record<string, jest.Mock>;
  let productUnitsService: Record<string, jest.Mock>;

  const mockQB = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementsService,
        {
          provide: getRepositoryToken(StockMovement),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQB),
          },
        },
        {
          provide: ProductUnitsService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(StockMovementsService);
    repo = module.get(getRepositoryToken(StockMovement));
    productUnitsService = module.get(ProductUnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an adjustment movement with conversion', async () => {
      productUnitsService.findOne.mockResolvedValue(mockProductUnit);
      repo.create.mockReturnValue(mockMovement);
      repo.save.mockResolvedValue(mockMovement);
      repo.findOne.mockResolvedValue(mockMovement);

      const result = await service.create({
        productUnitId: 'pu-1',
        quantity: '2',
      });

      expect(repo.create).toHaveBeenCalledWith({
        product: mockProduct,
        quantity: '100.000',
        movementType: MovementType.ADJUSTMENT,
      });
      expect(result).toEqual(mockMovement);
    });

    it('should throw BadRequestException for zero quantity', async () => {
      productUnitsService.findOne.mockResolvedValue(mockProductUnit);

      await expect(
        service.create({ productUnitId: 'pu-1', quantity: '0' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle negative quantity for stock reduction', async () => {
      productUnitsService.findOne.mockResolvedValue(mockProductUnit);
      const negativeMovement = {
        ...mockMovement,
        quantity: '-100.000',
      };
      repo.create.mockReturnValue(negativeMovement);
      repo.save.mockResolvedValue(negativeMovement);
      repo.findOne.mockResolvedValue(negativeMovement);

      const result = await service.create({
        productUnitId: 'pu-1',
        quantity: '-2',
      });

      expect(repo.create).toHaveBeenCalledWith({
        product: mockProduct,
        quantity: '-100.000',
        movementType: MovementType.ADJUSTMENT,
      });
      expect(result.quantity).toBe('-100.000');
    });
  });

  describe('findAll', () => {
    it('should return all movements', async () => {
      repo.find.mockResolvedValue([mockMovement]);
      expect(await service.findAll()).toEqual([mockMovement]);
    });
  });

  describe('findOne', () => {
    it('should return a movement', async () => {
      repo.findOne.mockResolvedValue(mockMovement);
      expect(await service.findOne('sm-1')).toEqual(mockMovement);
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a movement', async () => {
      repo.findOne.mockResolvedValue(mockMovement);
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('sm-1')).resolves.toBeUndefined();
    });
  });

  describe('createForSale', () => {
    it('should create negative movements for sale items', async () => {
      const saleItems = [
        {
          quantity: '2',
          productUnit: { product: mockProduct, conversionToBase: '50' },
        },
      ] as any;
      const sale = { id: 'sale-1' } as any;

      repo.create.mockImplementation((data) => data);
      repo.save.mockResolvedValue([]);

      await service.createForSale(sale, saleItems);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: '-100.000',
          movementType: MovementType.SALE,
        }),
      );
    });
  });

  describe('createForPurchase', () => {
    it('should create positive movements for purchase items', async () => {
      const purchaseItems = [
        {
          quantity: '3',
          productUnit: { product: mockProduct, conversionToBase: '50' },
        },
      ] as any;
      const purchase = { id: 'pur-1' } as any;

      repo.create.mockImplementation((data) => data);
      repo.save.mockResolvedValue([]);

      await service.createForPurchase(purchase, purchaseItems);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: '150.000',
          movementType: MovementType.PURCHASE,
        }),
      );
    });
  });

  describe('getStockByProduct', () => {
    it('should return aggregated stock', async () => {
      mockQB.getRawOne.mockResolvedValue({ total: '500.000' });

      const result = await service.getStockByProduct('prod-1');
      expect(result).toEqual({ productId: 'prod-1', quantity: '500.000' });
    });

    it('should return 0 when no movements', async () => {
      mockQB.getRawOne.mockResolvedValue({ total: '0' });

      const result = await service.getStockByProduct('prod-1');
      expect(result.quantity).toBe('0.000');
    });

    it('should return 0 when getRawOne returns null', async () => {
      mockQB.getRawOne.mockResolvedValue(null);

      const result = await service.getStockByProduct('prod-1');
      expect(result.quantity).toBe('0.000');
    });
  });
});
