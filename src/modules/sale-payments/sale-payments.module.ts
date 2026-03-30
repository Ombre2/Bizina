import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { SalesModule } from '../sales/sales.module';
import { SalePayment } from './entities/sale-payment.entity';
import { SalePaymentsController } from './sale-payments.controller';
import { SalePaymentsService } from './sale-payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalePayment]),
    forwardRef(() => SalesModule),
    PaymentMethodsModule,
  ],
  controllers: [SalePaymentsController],
  providers: [SalePaymentsService],
  exports: [SalePaymentsService],
})
export class SalePaymentsModule {}
