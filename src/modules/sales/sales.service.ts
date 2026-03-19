import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { CreateSaleItemDto } from '../sale-items/dto/create-sale-item.dto';
import { SaleItemsService } from '../sale-items/sale-items.service';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    private readonly customersService: CustomersService,
    private readonly saleItemsService: SaleItemsService,
    private readonly stockMovementsService: StockMovementsService,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const customer = createSaleDto.customerId
      ? await this.customersService.findOne(createSaleDto.customerId)
      : null;

    const sale = this.salesRepository.create({
      customer,
      saleDate: createSaleDto.saleDate,
      totalAmount: '0.00',
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

  findAll(): Promise<Sale[]> {
    return this.salesRepository.find({
      relations: {
        customer: true,
        saleItems: { productUnit: { product: true, unit: true } },
      },
      order: { saleDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        saleItems: { productUnit: { product: true, unit: true } },
      },
    });

    if (!sale) {
      throw new NotFoundException(`Vente avec l'identifiant ${id} introuvable`);
    }

    return sale;
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
