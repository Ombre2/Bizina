import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PurchaseItemService } from '../purchase-item/purchase-item.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { Purchase } from './entities/purchase.entity';
import { PurchaseService } from './purchase.service';

describe('PurchaseService', () => {
  let service: PurchaseService;
  const mockPurchasesRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const mockSuppliersService = {
    findOne: jest.fn(),
  };
  const mockPurchaseItemService = {
    createMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseService,
        {
          provide: getRepositoryToken(Purchase),
          useValue: mockPurchasesRepository,
        },
        {
          provide: SuppliersService,
          useValue: mockSuppliersService,
        },
        {
          provide: PurchaseItemService,
          useValue: mockPurchaseItemService,
        },
      ],
    }).compile();

    service = module.get<PurchaseService>(PurchaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
