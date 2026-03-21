import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { SalesService } from '../sales/sales.service';
import { SalePayment } from './entities/sale-payment.entity';
import { SalePaymentsService } from './sale-payments.service';

const mockPaymentMethod = { id: 'pm-1', name: 'Cash' };
const mockSale = {
  id: 'sale-1',
  totalAmount: '100.00',
  salePayments: [],
  remainingAmount: '100.00',
  paidAmount: '0.00',
};
const mockSalePayment: SalePayment = {
  id: 'sp-1',
  sale: mockSale as any,
  paymentMethod: mockPaymentMethod as any,
  amount: '50.00',
  paymentDate: new Date(),
};

describe('SalePaymentsService', () => {
  let service: SalePaymentsService;
  let repo: Record<string, jest.Mock>;
  let salesService: Record<string, jest.Mock>;
  let paymentMethodsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalePaymentsService,
        {
          provide: getRepositoryToken(SalePayment),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: SalesService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: PaymentMethodsService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(SalePaymentsService);
    repo = module.get(getRepositoryToken(SalePayment));
    salesService = module.get(SalesService);
    paymentMethodsService = module.get(PaymentMethodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment', async () => {
      salesService.findOne.mockResolvedValue(mockSale);
      paymentMethodsService.findOne.mockResolvedValue(mockPaymentMethod);
      repo.create.mockReturnValue(mockSalePayment);
      repo.save.mockResolvedValue(mockSalePayment);
      repo.findOne.mockResolvedValue(mockSalePayment);

      const result = await service.create({
        saleId: 'sale-1',
        paymentMethodId: 'pm-1',
        amount: '50.00',
      });

      expect(result).toEqual(mockSalePayment);
    });

    it('should throw BadRequestException for zero amount', async () => {
      salesService.findOne.mockResolvedValue(mockSale);

      await expect(
        service.create({
          saleId: 'sale-1',
          paymentMethodId: 'pm-1',
          amount: '0',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for negative amount', async () => {
      salesService.findOne.mockResolvedValue(mockSale);

      await expect(
        service.create({
          saleId: 'sale-1',
          paymentMethodId: 'pm-1',
          amount: '-10',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when exceeding remaining', async () => {
      salesService.findOne.mockResolvedValue({
        ...mockSale,
        remainingAmount: '30.00',
      });

      await expect(
        service.create({
          saleId: 'sale-1',
          paymentMethodId: 'pm-1',
          amount: '50.00',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all payments', async () => {
      repo.find.mockResolvedValue([mockSalePayment]);
      expect(await service.findAll()).toEqual([mockSalePayment]);
    });
  });

  describe('findOne', () => {
    it('should return a payment', async () => {
      repo.findOne.mockResolvedValue(mockSalePayment);
      expect(await service.findOne('sp-1')).toEqual(mockSalePayment);
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update paymentMethodId', async () => {
      repo.findOne.mockResolvedValue({ ...mockSalePayment });
      paymentMethodsService.findOne.mockResolvedValue({
        id: 'pm-2',
        name: 'Card',
      });
      repo.save.mockResolvedValue({ ...mockSalePayment });

      const result = await service.update('sp-1', { paymentMethodId: 'pm-2' });
      expect(result).toBeDefined();
    });

    it('should update amount', async () => {
      repo.findOne.mockResolvedValue({ ...mockSalePayment });
      repo.save.mockResolvedValue({ ...mockSalePayment, amount: '75.00' });

      const result = await service.update('sp-1', { amount: '75.00' });
      expect(result).toBeDefined();
    });

    it('should update saleId', async () => {
      repo.findOne.mockResolvedValue({ ...mockSalePayment });
      const newSale = { ...mockSale, id: 'sale-2' };
      salesService.findOne.mockResolvedValue(newSale);
      repo.save.mockResolvedValue({ ...mockSalePayment, sale: newSale });

      const result = await service.update('sp-1', { saleId: 'sale-2' });
      expect(result).toBeDefined();
    });

    it('should update paymentDate', async () => {
      const newDate = new Date('2025-06-15');
      repo.findOne.mockResolvedValue({ ...mockSalePayment });
      repo.save.mockResolvedValue({ ...mockSalePayment, paymentDate: newDate });

      const result = await service.update('sp-1', { paymentDate: newDate });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if payment not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('nope', { amount: '10.00' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a payment', async () => {
      repo.findOne.mockResolvedValue(mockSalePayment);
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('sp-1')).resolves.toBeUndefined();
    });
  });
});
