import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from 'src/types/pagination-params.type';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { CreatePurchaseItemDto } from '../purchase-item/dto/create-purchase-item.dto';
import { PurchaseItemService } from '../purchase-item/purchase-item.service';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { FindPurchaseDto } from './dto/find-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase } from './entities/purchase.entity';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
    private readonly purchaseItemService: PurchaseItemService,
    @Inject(forwardRef(() => SuppliersService))
    private readonly suppliersService: SuppliersService,
    @Inject(forwardRef(() => StockMovementsService))
    private readonly stockMovementsService: StockMovementsService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    const supplier = await this.suppliersService.findOne(
      createPurchaseDto.supplierId,
    );

    const purchase = this.purchasesRepository.create({
      supplier,
      purchaseDate: createPurchaseDto.purchaseDate,
      totalAmount: '0.00',
      missionId: createPurchaseDto.missionId, // Associer la mission à l'achat si fournie
    });

    const savedPurchase = await this.purchasesRepository.save(purchase);

    const purchaseItemsPayload: CreatePurchaseItemDto[] =
      createPurchaseDto.items.map((item) => ({
        purchaseId: savedPurchase.id,
        productUnitId: item.productUnitId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        missionId: createPurchaseDto.missionId, // Associer la mission à l'achat si fournie
      }));

    const createdItems =
      await this.purchaseItemService.createMany(purchaseItemsPayload);

    savedPurchase.totalAmount = createdItems
      .reduce((sum, item) => sum + Number(item.totalPrice), 0)
      .toFixed(2);
    await this.purchasesRepository.save(savedPurchase);

    await this.stockMovementsService.createForPurchase(
      savedPurchase,
      createdItems,
    );

    return this.findOne(savedPurchase.id);
  }

  async findAll(params: FindPurchaseDto): Promise<PaginatedResult<Purchase>> {
    const { page = 1, limit = 10, endDate, startDate, supplierId } = params;

    const where: FindOptionsWhere<Purchase> = {
      supplier: supplierId ? { id: supplierId } : undefined,
      purchaseDate:
        startDate && endDate
          ? Between(new Date(startDate), new Date(endDate))
          : undefined,
    };

    const [data, total] = await this.purchasesRepository.findAndCount({
      where: where,
      relations: ['supplier', 'purchaseItems'],
      order: {
        purchaseDate: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    const hasNextPage = page < Math.ceil(total / limit);

    return { data, total, hasNextPage, hasPreviousPage: page > 1 };
  }

  async findByMission(missionId: string): Promise<Purchase[]> {
    return this.purchasesRepository.find({
      where: { missionId },
      relations: {
        supplier: true,
        purchaseItems: {
          productUnit: {
            product: true,
            unit: true,
          },
        },
      },
      order: { purchaseDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Purchase> {
    const purchase = await this.purchasesRepository.findOne({
      where: { id },
      relations: {
        supplier: true,
        purchaseItems: {
          productUnit: {
            product: true,
            unit: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException(`Achat avec l'identifiant ${id} introuvable`);
    }

    return purchase;
  }

  async update(
    id: string,
    updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    const purchase = await this.findOne(id);

    if (updatePurchaseDto.supplierId !== undefined) {
      const supplier = await this.suppliersService.findOne(
        updatePurchaseDto.supplierId,
      );

      purchase.supplier = supplier;
    }

    if (updatePurchaseDto.purchaseDate !== undefined) {
      purchase.purchaseDate = updatePurchaseDto.purchaseDate;
    }

    await this.purchasesRepository.save(purchase);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    const result = await this.purchasesRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(`Achat avec l'identifiant ${id} introuvable`);
    }
  }
}
