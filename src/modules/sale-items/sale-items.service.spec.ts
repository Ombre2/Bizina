import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductUnitsService } from '../product-units/product-units.service';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SaleItemsService } from './sale-items.service';

describe('SaleItemsService', () => {
  let service: SaleItemsService;
  const mockSaleItemsRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const mockSalesRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const mockProductUnitsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleItemsService,
        {
          provide: getRepositoryToken(SaleItem),
          useValue: mockSaleItemsRepository,
        },
        {
          provide: getRepositoryToken(Sale),
          useValue: mockSalesRepository,
        },
        {
          provide: ProductUnitsService,
          useValue: mockProductUnitsService,
        },
      ],
    }).compile();

    service = module.get<SaleItemsService>(SaleItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
