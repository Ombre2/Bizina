import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomersService } from '../customers/customers.service';
import { SaleItemsService } from '../sale-items/sale-items.service';
import { Sale } from './entities/sale.entity';
import { SalesService } from './sales.service';

describe('SalesService', () => {
  let service: SalesService;
  const mockSalesRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const mockCustomersService = {
    findOne: jest.fn(),
  };
  const mockSaleItemsService = {
    create: jest.fn(),
    createMany: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getRepositoryToken(Sale),
          useValue: mockSalesRepository,
        },
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
        {
          provide: SaleItemsService,
          useValue: mockSaleItemsService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
