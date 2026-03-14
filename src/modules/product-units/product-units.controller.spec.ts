import { Test, TestingModule } from '@nestjs/testing';
import { ProductUnitsController } from './product-units.controller';
import { ProductUnitsService } from './product-units.service';

describe('ProductUnitsController', () => {
  let controller: ProductUnitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductUnitsController],
      providers: [
        {
          provide: ProductUnitsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductUnitsController>(ProductUnitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
