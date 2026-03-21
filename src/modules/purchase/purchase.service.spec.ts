import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PurchaseItemService } from '../purchase-item/purchase-item.service';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './purchase.service';

const mockSupplier = { id: 'sup-1', name: 'Supplier A' };
const mockPurchase: Purchase = {
  id: 'pur-1',
  supplier: mockSupplier as any,
  purchaseItems: [],
  purchaseDate: new Date('2025-01-01'),
  totalAmount: '100.00',
  createdAt: new Date(),
};

describe('PurchaseService', () => {
  let service: PurchaseService;
  let repo: Record<string, jest.Mock>;
  let suppliersService: Record<string, jest.Mock>;
  let purchaseItemService: Record<string, jest.Mock>;
  let stockMovementsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseService,
        {
          provide: getRepositoryToken(Purchase),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: SuppliersService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: PurchaseItemService,
          useValue: { createMany: jest.fn() },
        },
        {
          provide: StockMovementsService,
          useValue: { createForPurchase: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(PurchaseService);
    repo = module.get(getRepositoryToken(Purchase));
    suppliersService = module.get(SuppliersService);
    purchaseItemService = module.get(PurchaseItemService);
    stockMovementsService = module.get(StockMovementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a purchase with items and stock movements', async () => {
      suppliersService.findOne.mockResolvedValue(mockSupplier);
      repo.create.mockReturnValue({ ...mockPurchase, totalAmount: '0.00' });
      repo.save.mockResolvedValue(mockPurchase);
      purchaseItemService.createMany.mockResolvedValue([
        {
          totalPrice: '50.00',
          productUnit: { product: {}, conversionToBase: '1' },
        },
        {
          totalPrice: '50.00',
          productUnit: { product: {}, conversionToBase: '1' },
        },
      ]);
      stockMovementsService.createForPurchase.mockResolvedValue(undefined);
      repo.findOne.mockResolvedValue(mockPurchase);

      const result = await service.create({
        supplierId: 'sup-1',
        purchaseDate: new Date('2025-01-01'),
        items: [{ productUnitId: 'pu-1', quantity: '10', unitPrice: '5.00' }],
      });

      expect(result).toEqual(mockPurchase);
      expect(stockMovementsService.createForPurchase).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all purchases', async () => {
      repo.find.mockResolvedValue([mockPurchase]);
      expect(await service.findAll()).toEqual([mockPurchase]);
    });
  });

  describe('findOne', () => {
    it('should return a purchase', async () => {
      repo.findOne.mockResolvedValue(mockPurchase);
      expect(await service.findOne('pur-1')).toEqual(mockPurchase);
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update supplier and date', async () => {
      repo.findOne.mockResolvedValue({ ...mockPurchase });
      const newSupplier = { id: 'sup-2', name: 'Supplier B' };
      suppliersService.findOne.mockResolvedValue(newSupplier);
      repo.save.mockResolvedValue({ ...mockPurchase, supplier: newSupplier });

      const result = await service.update('pur-1', { supplierId: 'sup-2' });
      expect(result).toBeDefined();
    });

    it('should update only purchaseDate without changing supplier', async () => {
      const newDate = new Date('2025-06-15');
      repo.findOne.mockResolvedValue({ ...mockPurchase });
      repo.save.mockResolvedValue({ ...mockPurchase, purchaseDate: newDate });

      const result = await service.update('pur-1', { purchaseDate: newDate });
      expect(result).toBeDefined();
      expect(suppliersService.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if purchase not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.update('nope', { purchaseDate: new Date() }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete', async () => {
      repo.findOne.mockResolvedValue(mockPurchase);
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('pur-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(mockPurchase);
      repo.delete.mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
