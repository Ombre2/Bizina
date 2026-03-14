import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { UnitsService } from '../units/units.service';
import { ProductUnit } from './entities/product-unit.entity';
import { ProductUnitsService } from './product-units.service';

describe('ProductUnitsService', () => {
  let service: ProductUnitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductUnitsService,
        {
          provide: getRepositoryToken(ProductUnit),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: UnitsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductUnitsService>(ProductUnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
