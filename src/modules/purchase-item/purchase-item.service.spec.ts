import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductUnitsService } from '../product-units/product-units.service';
import { Purchase } from '../purchase/entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { PurchaseItemService } from './purchase-item.service';

const mockPurchase = { id: 'pur-1' } as Purchase;
const mockProductUnit = {
  id: 'pu-1',
  product: { id: 'prod-1', name: 'Rice' },
  unit: { id: 'unit-1', name: 'kg' },
  conversionToBase: '1',
};
const mockPurchaseItem: PurchaseItem = {
  id: 'pi-1',
  purchase: mockPurchase,
  productUnit: mockProductUnit as any,
  quantity: '10',
  unitPrice: '5.00',
  totalPrice: '50.00',
};

describe('PurchaseItemService', () => {
  let service: PurchaseItemService;
  let piRepo: Record<string, jest.Mock>;
  let purchaseRepo: Record<string, jest.Mock>;
  let productUnitsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseItemService,
        {
          provide: getRepositoryToken(PurchaseItem),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            manager: {
              getRepository: jest.fn().mockReturnValue({
                find: jest.fn().mockResolvedValue([mockProductUnit]),
              }),
            },
          },
        },
        {
          provide: getRepositoryToken(Purchase),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: ProductUnitsService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(PurchaseItemService);
    piRepo = module.get(getRepositoryToken(PurchaseItem));
    purchaseRepo = module.get(getRepositoryToken(Purchase));
    productUnitsService = module.get(ProductUnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a purchase item', async () => {
      purchaseRepo.findOne.mockResolvedValue(mockPurchase);
      productUnitsService.findOne.mockResolvedValue(mockProductUnit);
      piRepo.create.mockReturnValue(mockPurchaseItem);
      piRepo.save.mockResolvedValue(mockPurchaseItem);
      piRepo.findOne.mockResolvedValue(mockPurchaseItem);

      const result = await service.create({
        purchaseId: 'pur-1',
        productUnitId: 'pu-1',
        quantity: '10',
        unitPrice: '5.00',
      });

      expect(result).toEqual(mockPurchaseItem);
    });

    it('should throw NotFoundException if purchase not found', async () => {
      purchaseRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          purchaseId: 'nope',
          productUnitId: 'pu-1',
          quantity: '10',
          unitPrice: '5.00',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createMany', () => {
    it('should return empty array for empty input', async () => {
      expect(await service.createMany([])).toEqual([]);
    });

    it('should create multiple items', async () => {
      purchaseRepo.find.mockResolvedValue([mockPurchase]);
      piRepo.create.mockReturnValue(mockPurchaseItem);
      piRepo.save.mockResolvedValue([mockPurchaseItem]);
      piRepo.find.mockResolvedValue([mockPurchaseItem]);

      const result = await service.createMany([
        {
          purchaseId: 'pur-1',
          productUnitId: 'pu-1',
          quantity: '10',
          unitPrice: '5.00',
        },
      ]);

      expect(result).toEqual([mockPurchaseItem]);
    });

    it('should throw NotFoundException if purchase not found in createMany', async () => {
      purchaseRepo.find.mockResolvedValue([]);
      piRepo.create.mockImplementation((data) => data);

      await expect(
        service.createMany([
          {
            purchaseId: 'nope',
            productUnitId: 'pu-1',
            quantity: '10',
            unitPrice: '5.00',
          },
        ]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if productUnit not found in createMany', async () => {
      purchaseRepo.find.mockResolvedValue([mockPurchase]);
      piRepo.manager.getRepository.mockReturnValue({
        find: jest.fn().mockResolvedValue([]),
      });
      piRepo.create.mockImplementation((data) => data);

      await expect(
        service.createMany([
          {
            purchaseId: 'pur-1',
            productUnitId: 'nope',
            quantity: '10',
            unitPrice: '5.00',
          },
        ]),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all purchase items', async () => {
      piRepo.find.mockResolvedValue([mockPurchaseItem]);
      expect(await service.findAll()).toEqual([mockPurchaseItem]);
    });
  });

  describe('findOne', () => {
    it('should return a purchase item', async () => {
      piRepo.findOne.mockResolvedValue(mockPurchaseItem);
      expect(await service.findOne('pi-1')).toEqual(mockPurchaseItem);
    });

    it('should throw NotFoundException', async () => {
      piRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a purchase item', async () => {
      piRepo.findOne.mockResolvedValue(mockPurchaseItem);
      piRepo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('pi-1')).resolves.toBeUndefined();
    });
  });
});
