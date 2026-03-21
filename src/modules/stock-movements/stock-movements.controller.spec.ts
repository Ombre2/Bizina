import { Test, TestingModule } from '@nestjs/testing';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';

describe('StockMovementsController', () => {
  let controller: StockMovementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockMovementsController],
      providers: [
        {
          provide: StockMovementsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            getStockByProduct: jest.fn(),
            createForSale: jest.fn(),
            createForPurchase: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StockMovementsController>(StockMovementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
