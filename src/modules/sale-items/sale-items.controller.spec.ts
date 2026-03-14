import { Test, TestingModule } from '@nestjs/testing';
import { SaleItemsController } from './sale-items.controller';
import { SaleItemsService } from './sale-items.service';

describe('SaleItemsController', () => {
  let controller: SaleItemsController;
  const mockSaleItemsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaleItemsController],
      providers: [
        {
          provide: SaleItemsService,
          useValue: mockSaleItemsService,
        },
      ],
    }).compile();

    controller = module.get<SaleItemsController>(SaleItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
