import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { ProductUnitsService } from '../product-units/product-units.service';
import { CreateSaleItemDto } from '../sale-items/dto/create-sale-item.dto';
import { SaleItemsService } from '../sale-items/sale-items.service';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PaymentStatus, Sale } from './entities/sale.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    private readonly customersService: CustomersService,
    private readonly saleItemsService: SaleItemsService,
    private readonly stockMovementsService: StockMovementsService,
    private readonly productUnitsService: ProductUnitsService,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const customer = createSaleDto.customerId
      ? await this.customersService.findOne(createSaleDto.customerId)
      : null;

    // Vérification du stock disponible pour chaque item
    for (const item of createSaleDto.items) {
      const productUnit = await this.productUnitsService.findOne(
        item.productUnitId,
      );

      const stock = await this.stockMovementsService.getStockByProduct(
        productUnit.product.id,
      );
      const requestedInBase =
        Number(item.quantity) * Number(productUnit.conversionToBase);
      const availableStock = Number(stock.quantity);

      if (requestedInBase > availableStock) {
        throw new BadRequestException(
          `Stock insuffisant pour "${productUnit.product.name}". ` +
            `Disponible: ${availableStock.toFixed(3)} ${productUnit.product.baseUnit?.symbol ?? ''}, ` +
            `Demandé: ${requestedInBase.toFixed(3)} ${productUnit.product.baseUnit?.symbol ?? ''}`,
        );
      }
    }

    const sale = this.salesRepository.create({
      customer,
      saleDate: createSaleDto.saleDate,
      totalAmount: '0.00',
      missionId: createSaleDto.missionId, // Associer la mission à la vente si fournie
    });

    const savedSale = await this.salesRepository.save(sale);

    const saleItemsPayload: CreateSaleItemDto[] = createSaleDto.items.map(
      (item) => ({
        saleId: savedSale.id,
        productUnitId: item.productUnitId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }),
    );

    const createdItems =
      await this.saleItemsService.createMany(saleItemsPayload);

    savedSale.totalAmount = createdItems
      .reduce((sum, item) => sum + Number(item.totalPrice), 0)
      .toFixed(2);

    await this.salesRepository.save(savedSale);

    await this.stockMovementsService.createForSale(savedSale, createdItems);

    return this.findOne(savedSale.id);
  }

  private withPaymentStatus(sale: Sale) {
    console.log(sale);

    const total = Number(sale.totalAmount ?? 0);
    const paid = (sale.salePayments ?? []).reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const remaining = total - paid;

    let paymentStatus: PaymentStatus;
    if (paid <= 0) {
      paymentStatus = PaymentStatus.UNPAID;
    } else if (paid >= total) {
      paymentStatus = PaymentStatus.PAID;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    return {
      ...sale,
      paymentStatus,
      paidAmount: paid.toFixed(2),
      remainingAmount: remaining.toFixed(2),
    };
  }

  async findAll() {
    const sales = await this.salesRepository.find({
      relations: {
        customer: true,
        saleItems: { productUnit: { product: true, unit: true } },
        salePayments: { paymentMethod: true },
      },
      order: { saleDate: 'DESC' },
    });
    return sales.map((sale) => this.withPaymentStatus(sale));
  }

  async findByMission(missionId: string) {
    const sales = await this.salesRepository.find({
      where: { missionId },
      relations: {
        customer: true,
        saleItems: { productUnit: { product: true, unit: true } },
        salePayments: { paymentMethod: true },
      },
      order: { saleDate: 'DESC' },
    });
    return sales.map((sale) => this.withPaymentStatus(sale));
  }

  async findOne(id: string) {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        saleItems: { productUnit: { product: true, unit: true } },
        salePayments: { paymentMethod: true },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Vente avec l'identifiant ${id} introuvable`);
    }

    return this.withPaymentStatus(sale);
  }

  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.findOne(id);

    if (updateSaleDto.customerId !== undefined) {
      sale.customer = updateSaleDto.customerId
        ? await this.customersService.findOne(updateSaleDto.customerId)
        : null;
    }

    if (updateSaleDto.saleDate !== undefined) {
      sale.saleDate = updateSaleDto.saleDate;
    }

    await this.salesRepository.save(sale);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.salesRepository.delete({ id });
  }
}
