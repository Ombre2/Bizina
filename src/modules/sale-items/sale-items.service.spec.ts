import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductUnitsService } from '../product-units/product-units.service';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SaleItemsService } from './sale-items.service';

const mockSale = { id: 'sale-1' } as Sale;
const mockProductUnit = {
  id: 'pu-1',
  product: { id: 'prod-1', name: 'Rice' },
  unit: { id: 'unit-1', name: 'kg' },
  conversionToBase: '1',
};
const mockSaleItem: SaleItem = {
  id: 'si-1',
  sale: mockSale,
  productUnit: mockProductUnit as any,
  quantity: '5',
  unitPrice: '20.00',
  totalPrice: '100.00',
};

describe('SaleItemsService', () => {
  let service: SaleItemsService;
  let siRepo: Record<string, jest.Mock>;
  let salesRepo: Record<string, jest.Mock>;
  let productUnitsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleItemsService,
        {
          provide: getRepositoryToken(SaleItem),
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
          provide: getRepositoryToken(Sale),
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

    service = module.get(SaleItemsService);
    siRepo = module.get(getRepositoryToken(SaleItem));
    salesRepo = module.get(getRepositoryToken(Sale));
    productUnitsService = module.get(ProductUnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a sale item', async () => {
      salesRepo.findOne.mockResolvedValue(mockSale);
      productUnitsService.findOne.mockResolvedValue(mockProductUnit);
      siRepo.create.mockReturnValue(mockSaleItem);
      siRepo.save.mockResolvedValue(mockSaleItem);
      siRepo.findOne.mockResolvedValue(mockSaleItem);

      const result = await service.create({
        saleId: 'sale-1',
        productUnitId: 'pu-1',
        quantity: '5',
        unitPrice: '20.00',
      });

      expect(result).toEqual(mockSaleItem);
    });

    it('should throw NotFoundException if sale not found', async () => {
      salesRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          saleId: 'nope',
          productUnitId: 'pu-1',
          quantity: '5',
          unitPrice: '20.00',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createMany', () => {
    it('should return empty array for empty input', async () => {
      expect(await service.createMany([])).toEqual([]);
    });

    it('should create multiple items', async () => {
      salesRepo.find.mockResolvedValue([mockSale]);
      siRepo.create.mockReturnValue(mockSaleItem);
      siRepo.save.mockResolvedValue([mockSaleItem]);
      siRepo.find.mockResolvedValue([mockSaleItem]);

      const result = await service.createMany([
        {
          saleId: 'sale-1',
          productUnitId: 'pu-1',
          quantity: '5',
          unitPrice: '20.00',
        },
      ]);

      expect(result).toEqual([mockSaleItem]);
    });

    it('should throw NotFoundException if sale not found in createMany', async () => {
      salesRepo.find.mockResolvedValue([]);
      siRepo.create.mockImplementation((data) => data);

      await expect(
        service.createMany([
          {
            saleId: 'nope',
            productUnitId: 'pu-1',
            quantity: '5',
            unitPrice: '20.00',
          },
        ]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if productUnit not found in createMany', async () => {
      salesRepo.find.mockResolvedValue([mockSale]);
      siRepo.manager.getRepository.mockReturnValue({
        find: jest.fn().mockResolvedValue([]),
      });
      siRepo.create.mockImplementation((data) => data);

      await expect(
        service.createMany([
          {
            saleId: 'sale-1',
            productUnitId: 'nope',
            quantity: '5',
            unitPrice: '20.00',
          },
        ]),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all sale items', async () => {
      siRepo.find.mockResolvedValue([mockSaleItem]);
      expect(await service.findAll()).toEqual([mockSaleItem]);
    });
  });

  describe('findOne', () => {
    it('should return a sale item', async () => {
      siRepo.findOne.mockResolvedValue(mockSaleItem);
      expect(await service.findOne('si-1')).toEqual(mockSaleItem);
    });

    it('should throw NotFoundException', async () => {
      siRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a sale item', async () => {
      siRepo.findOne.mockResolvedValue(mockSaleItem);
      siRepo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('si-1')).resolves.toBeUndefined();
    });
  });
});
