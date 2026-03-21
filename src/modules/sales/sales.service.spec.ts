import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomersService } from '../customers/customers.service';
import { ProductUnitsService } from '../product-units/product-units.service';
import { SaleItemsService } from '../sale-items/sale-items.service';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { PaymentStatus, Sale } from './entities/sale.entity';
import { SalesService } from './sales.service';

const mockCustomer = { id: 'cust-1', name: 'Client A' };
const mockSale: Sale = {
  id: 'sale-1',
  customerId: 'cust-1',
  customer: mockCustomer as any,
  saleItems: [],
  salePayments: [],
  saleDate: new Date('2025-01-01'),
  totalAmount: '100.00',
  createdAt: new Date(),
};

const mockProductUnit = {
  id: 'pu-1',
  product: { id: 'prod-1', name: 'Rice', baseUnit: { symbol: 'kg' } },
  unit: { id: 'unit-1', name: 'Sac' },
  conversionToBase: '50',
};

describe('SalesService', () => {
  let service: SalesService;
  let repo: Record<string, jest.Mock>;
  let customersService: Record<string, jest.Mock>;
  let saleItemsService: Record<string, jest.Mock>;
  let stockMovementsService: Record<string, jest.Mock>;
  let productUnitsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getRepositoryToken(Sale),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CustomersService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: SaleItemsService,
          useValue: { createMany: jest.fn() },
        },
        {
          provide: StockMovementsService,
          useValue: {
            getStockByProduct: jest.fn(),
            createForSale: jest.fn(),
          },
        },
        {
          provide: ProductUnitsService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(SalesService);
    repo = module.get(getRepositoryToken(Sale));
    customersService = module.get(CustomersService);
    saleItemsService = module.get(SaleItemsService);
    stockMovementsService = module.get(StockMovementsService);
    productUnitsService = module.get(ProductUnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a sale with stock verification', async () => {
      customersService.findOne.mockResolvedValue(mockCustomer);
      productUnitsService.findOne.mockResolvedValue(mockProductUnit);
      stockMovementsService.getStockByProduct.mockResolvedValue({
        productId: 'prod-1',
        quantity: '500.000',
      });
      repo.create.mockReturnValue({ ...mockSale, totalAmount: '0.00' });
      repo.save.mockResolvedValue(mockSale);
      saleItemsService.createMany.mockResolvedValue([
        { totalPrice: '100.00', productUnit: mockProductUnit },
      ]);
      stockMovementsService.createForSale.mockResolvedValue(undefined);
      repo.findOne.mockResolvedValue(mockSale);

      const result = await service.create({
        customerId: 'cust-1',
        saleDate: new Date('2025-01-01'),
        items: [{ productUnitId: 'pu-1', quantity: '2', unitPrice: '50.00' }],
      });

      expect(result).toBeDefined();
      expect(stockMovementsService.createForSale).toHaveBeenCalled();
    });

    it('should throw BadRequestException for insufficient stock', async () => {
      productUnitsService.findOne.mockResolvedValue(mockProductUnit);
      stockMovementsService.getStockByProduct.mockResolvedValue({
        productId: 'prod-1',
        quantity: '10.000',
      });

      await expect(
        service.create({
          saleDate: new Date(),
          items: [{ productUnitId: 'pu-1', quantity: '2', unitPrice: '50.00' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow sale without customer', async () => {
      productUnitsService.findOne.mockResolvedValue(mockProductUnit);
      stockMovementsService.getStockByProduct.mockResolvedValue({
        productId: 'prod-1',
        quantity: '500.000',
      });
      repo.create.mockReturnValue({
        ...mockSale,
        customer: null,
        totalAmount: '0.00',
      });
      repo.save.mockResolvedValue({ ...mockSale, customer: null });
      saleItemsService.createMany.mockResolvedValue([
        { totalPrice: '100.00', productUnit: mockProductUnit },
      ]);
      stockMovementsService.createForSale.mockResolvedValue(undefined);
      repo.findOne.mockResolvedValue({
        ...mockSale,
        customer: null,
        salePayments: [],
      });

      const result = await service.create({
        saleDate: new Date(),
        items: [{ productUnitId: 'pu-1', quantity: '1', unitPrice: '100.00' }],
      });

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all sales with payment status', async () => {
      repo.find.mockResolvedValue([{ ...mockSale, salePayments: [] }]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].paymentStatus).toBe(PaymentStatus.UNPAID);
    });
  });

  describe('findOne', () => {
    it('should return a sale with payment status', async () => {
      repo.findOne.mockResolvedValue({
        ...mockSale,
        salePayments: [{ amount: '50.00' }],
      });

      const result = await service.findOne('sale-1');
      expect(result.paymentStatus).toBe(PaymentStatus.PARTIAL);
      expect(result.paidAmount).toBe('50.00');
      expect(result.remainingAmount).toBe('50.00');
    });

    it('should return PAID status when fully paid', async () => {
      repo.findOne.mockResolvedValue({
        ...mockSale,
        salePayments: [{ amount: '100.00' }],
      });

      const result = await service.findOne('sale-1');
      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update the sale with new customer', async () => {
      repo.findOne.mockResolvedValue({ ...mockSale, salePayments: [] });
      customersService.findOne.mockResolvedValue(mockCustomer);
      repo.save.mockResolvedValue(mockSale);

      const result = await service.update('sale-1', { customerId: 'cust-1' });
      expect(result).toBeDefined();
    });

    it('should update only saleDate without changing customer', async () => {
      const newDate = new Date('2025-06-15');
      repo.findOne.mockResolvedValue({ ...mockSale, salePayments: [] });
      repo.save.mockResolvedValue({ ...mockSale, saleDate: newDate });

      const result = await service.update('sale-1', { saleDate: newDate });
      expect(result).toBeDefined();
      expect(customersService.findOne).not.toHaveBeenCalled();
    });

    it('should remove customer by setting customerId to null', async () => {
      repo.findOne.mockResolvedValue({ ...mockSale, salePayments: [] });
      repo.save.mockResolvedValue({ ...mockSale, customer: null });

      const result = await service.update('sale-1', { customerId: null });
      expect(result).toBeDefined();
      expect(customersService.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if sale not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.update('nope', { saleDate: new Date() }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a sale', async () => {
      repo.findOne.mockResolvedValue({ ...mockSale, salePayments: [] });
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('sale-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if sale not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
