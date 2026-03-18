import { PartialType } from '@nestjs/swagger';
import { CreateSalePaymentDto } from './create-sale-payment.dto';

export class UpdateSalePaymentDto extends PartialType(CreateSalePaymentDto) {}
