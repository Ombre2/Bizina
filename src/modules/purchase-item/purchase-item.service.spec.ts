import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductUnitsService } from '../product-units/product-units.service';
import { Purchase } from '../purchase/entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { PurchaseItemService } from './purchase-item.service';

describe('PurchaseItemService', () => {
  let service: PurchaseItemService;
  const mockPurchaseItemsRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const mockPurchasesRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const mockProductUnitsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseItemService,
        {
          provide: getRepositoryToken(PurchaseItem),
          useValue: mockPurchaseItemsRepository,
        },
        {
          provide: getRepositoryToken(Purchase),
          useValue: mockPurchasesRepository,
        },
        {
          provide: ProductUnitsService,
          useValue: mockProductUnitsService,
        },
      ],
    }).compile();

    service = module.get<PurchaseItemService>(PurchaseItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
