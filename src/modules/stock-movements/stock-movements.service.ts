import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductUnitsService } from '../product-units/product-units.service';
import type { PurchaseItem } from '../purchase-item/entities/purchase-item.entity';
import type { Purchase } from '../purchase/entities/purchase.entity';
import type { SaleItem } from '../sale-items/entities/sale-item.entity';
import type { Sale } from '../sales/entities/sale.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
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

  findAll(): Promise<StockMovement[]> {
    return this.stockMovementsRepository.find({
      relations: {
        product: true,
        sale: true,
        purchase: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
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
