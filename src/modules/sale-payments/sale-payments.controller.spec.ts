import { Test, TestingModule } from '@nestjs/testing';
import { SalePaymentsController } from './sale-payments.controller';
import { SalePaymentsService } from './sale-payments.service';

describe('SalePaymentsController', () => {
  let controller: SalePaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalePaymentsController],
      providers: [SalePaymentsService],
    }).compile();

    controller = module.get<SalePaymentsController>(SalePaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
