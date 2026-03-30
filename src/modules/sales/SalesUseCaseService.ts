import { Injectable } from '@nestjs/common';
import { SalePaymentsService } from '../sale-payments/sale-payments.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SalesService } from './sales.service';

@Injectable()
export class SalesUseCaseService {
  constructor(
    private readonly salesService: SalesService,
    private readonly salePaymentsService: SalePaymentsService,
  ) {}

  async createSaleWithPayment(dto: CreateSaleDto) {
    // 1️⃣ Crée la vente (SalesService)
    const sale = await this.salesService.create(dto);

    // 2️⃣ Crée le paiement immédiat (SalePaymentsService)
    if (dto.payments?.immediatePayment) {
      await this.salePaymentsService.create({
        saleId: sale.id,
        amount: sale.totalAmount,
        paymentMethodId: dto.payments.paymentMethod,
      });
    }

    // 3️⃣ Retourne la vente finale
    return this.salesService.findOne(sale.id);
  }
}
