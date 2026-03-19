import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { SalesService } from '../sales/sales.service';
import { CreateSalePaymentDto } from './dto/create-sale-payment.dto';
import { UpdateSalePaymentDto } from './dto/update-sale-payment.dto';
import { SalePayment } from './entities/sale-payment.entity';

@Injectable()
export class SalePaymentsService {
  constructor(
    @InjectRepository(SalePayment)
    private readonly salePaymentsRepository: Repository<SalePayment>,
    private readonly salesService: SalesService,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  async create(
    createSalePaymentDto: CreateSalePaymentDto,
  ): Promise<SalePayment> {
    const sale = await this.salesService.findOne(createSalePaymentDto.saleId);

    const remaining = Number(sale.remainingAmount);
    const paymentAmount = Number(createSalePaymentDto.amount);

    if (paymentAmount <= 0) {
      throw new BadRequestException(
        'Le montant du paiement doit être supérieur à 0',
      );
    }

    if (paymentAmount > remaining) {
      throw new BadRequestException(
        `Le montant du paiement (${paymentAmount.toFixed(2)}) dépasse le montant restant dû (${remaining.toFixed(2)})`,
      );
    }

    const paymentMethod = await this.paymentMethodsService.findOne(
      createSalePaymentDto.paymentMethodId,
    );

    const salePayment = this.salePaymentsRepository.create({
      sale,
      paymentMethod,
      amount: createSalePaymentDto.amount,
      ...(createSalePaymentDto.paymentDate && {
        paymentDate: createSalePaymentDto.paymentDate,
      }),
    });

    const saved = await this.salePaymentsRepository.save(salePayment);

    return this.findOne(saved.id);
  }

  findAll(): Promise<SalePayment[]> {
    return this.salePaymentsRepository.find({
      relations: {
        sale: true,
        paymentMethod: true,
      },
      order: {
        paymentDate: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<SalePayment> {
    const salePayment = await this.salePaymentsRepository.findOne({
      where: { id },
      relations: {
        sale: true,
        paymentMethod: true,
      },
    });

    if (!salePayment) {
      throw new NotFoundException(
        `Paiement avec l'identifiant ${id} introuvable`,
      );
    }

    return salePayment;
  }

  async update(
    id: string,
    updateSalePaymentDto: UpdateSalePaymentDto,
  ): Promise<SalePayment> {
    const salePayment = await this.findOne(id);

    if (updateSalePaymentDto.saleId) {
      salePayment.sale = await this.salesService.findOne(
        updateSalePaymentDto.saleId,
      );
    }

    if (updateSalePaymentDto.paymentMethodId) {
      salePayment.paymentMethod = await this.paymentMethodsService.findOne(
        updateSalePaymentDto.paymentMethodId,
      );
    }

    if (updateSalePaymentDto.amount) {
      salePayment.amount = updateSalePaymentDto.amount;
    }

    if (updateSalePaymentDto.paymentDate) {
      salePayment.paymentDate = updateSalePaymentDto.paymentDate;
    }

    await this.salePaymentsRepository.save(salePayment);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.salePaymentsRepository.delete({ id });
  }
}
