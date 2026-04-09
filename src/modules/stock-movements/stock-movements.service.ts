import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from 'src/types/pagination-params.type';
import { Repository } from 'typeorm';
import { ProductUnitsService } from '../product-units/product-units.service';
import type { PurchaseItem } from '../purchase-item/entities/purchase-item.entity';
import type { Purchase } from '../purchase/entities/purchase.entity';
import type { SaleItem } from '../sale-items/entities/sale-item.entity';
import type { Sale } from '../sales/entities/sale.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { FindStockMovementsDto } from './dto/find-stock-movements.dto';
import { MovementType, StockMovement } from './entities/stock-movement.entity';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly stockMovementsRepository: Repository<StockMovement>,

    @Inject(forwardRef(() => ProductUnitsService))
    private readonly productUnitsService: ProductUnitsService,
  ) {}

  async create(
    createStockMovementDto: CreateStockMovementDto,
  ): Promise<StockMovement> {
    const productUnit = await this.productUnitsService.findOne(
      createStockMovementDto.productUnitId,
    );

    const rawQty = Number(createStockMovementDto.quantity);
    if (rawQty === 0) {
      throw new BadRequestException('La quantité ne peut pas être égale à 0');
    }

    const quantityInBase = rawQty * Number(productUnit.conversionToBase);

    const stockMovement = this.stockMovementsRepository.create({
      product: productUnit.product,
      quantity: quantityInBase.toFixed(3),
      movementType: MovementType.ADJUSTMENT,
    });

    const saved = await this.stockMovementsRepository.save(stockMovement);

    return this.findOne(saved.id);
  }

  async findAll(
    params: FindStockMovementsDto,
  ): Promise<PaginatedResult<StockMovement>> {
    const {
      page = 1,
      limit = 10,
      searchQuery,
      startDate,
      endDate,
      productId,
      movementType,
    } = params;

    const qb = this.stockMovementsRepository
      .createQueryBuilder('sm')
      .leftJoinAndSelect('sm.product', 'product')
      .leftJoinAndSelect('product.baseUnit', 'baseUnit')
      .leftJoinAndSelect('sm.sale', 'sale')
      .leftJoinAndSelect('sm.purchase', 'purchase')
      .leftJoinAndSelect('sm.mission', 'mission');

    if (searchQuery) {
      qb.andWhere('product.name LIKE :search', {
        search: `%${searchQuery}%`,
      });
    }

    if (productId) {
      qb.andWhere('product.id = :productId', { productId });
    }

    if (movementType) {
      qb.andWhere('sm.movementType = :movementType', { movementType });
    }

    if (startDate && endDate) {
      qb.andWhere('sm.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    qb.orderBy('sm.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    };
  }

  async findOne(id: string): Promise<StockMovement> {
    const stockMovement = await this.stockMovementsRepository.findOne({
      where: { id },
      relations: {
        product: true,
        sale: true,
        purchase: true,
      },
    });

    if (!stockMovement) {
      throw new NotFoundException(
        `Mouvement de stock avec l'identifiant ${id} introuvable`,
      );
    }

    return stockMovement;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.stockMovementsRepository.delete({ id });
  }

  async createForSale(sale: Sale, items: SaleItem[]): Promise<void> {
    const movements = items.map((item) => {
      const quantityInBase =
        Number(item.quantity) * Number(item.productUnit.conversionToBase);

      return this.stockMovementsRepository.create({
        product: item.productUnit.product,
        quantity: (-quantityInBase).toFixed(3),
        movementType: MovementType.SALE,
        sale,
      });
    });

    await this.stockMovementsRepository.save(movements);
  }

  async createForPurchase(
    purchase: Purchase,
    items: PurchaseItem[],
  ): Promise<void> {
    const movements = items.map((item) => {
      const quantityInBase =
        Number(item.quantity) * Number(item.productUnit.conversionToBase);

      return this.stockMovementsRepository.create({
        product: item.productUnit.product,
        quantity: quantityInBase.toFixed(3),
        movementType: MovementType.PURCHASE,
        purchase,
        missionId: purchase.missionId,
      });
    });

    await this.stockMovementsRepository.save(movements);
  }

  async getStockByProduct(
    productId: string,
  ): Promise<{ productId: string; quantity: string }> {
    const result = await this.stockMovementsRepository
      .createQueryBuilder('sm')
      .select('COALESCE(SUM(sm.quantity), 0)', 'total')
      .where('sm.product_id = :productId', { productId })
      .getRawOne<{ total: string }>();

    return {
      productId,
      quantity: Number(result?.total ?? 0).toFixed(3),
    };
  }
}
