import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseItemController } from './purchase-item.controller';
import { PurchaseItemService } from './purchase-item.service';

describe('PurchaseItemController', () => {
  let controller: PurchaseItemController;
  const mockPurchaseItemService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseItemController],
      providers: [
        {
          provide: PurchaseItemService,
          useValue: mockPurchaseItemService,
        },
      ],
    }).compile();

    controller = module.get<PurchaseItemController>(PurchaseItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
