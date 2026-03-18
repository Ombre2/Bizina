import { Test, TestingModule } from '@nestjs/testing';
import { SalePaymentsService } from './sale-payments.service';

describe('SalePaymentsService', () => {
  let service: SalePaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalePaymentsService],
    }).compile();

    service = module.get<SalePaymentsService>(SalePaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
