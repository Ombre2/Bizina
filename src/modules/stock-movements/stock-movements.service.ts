import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
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

    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  async create(
    createStockMovementDto: CreateStockMovementDto,
  ): Promise<StockMovement> {
    const product = await this.productsService.findOne(
      createStockMovementDto.productId,
    );

    const stockMovement = this.stockMovementsRepository.create({
      product,
      quantity: createStockMovementDto.quantity,
      movementType: createStockMovementDto.movementType,
      saleId: createStockMovementDto.saleId,
      purchaseId: createStockMovementDto.purchaseId,
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
    const movements = items.map((item) =>
      this.stockMovementsRepository.create({
        product: item.productUnit.product,
        quantity: (-Number(item.quantity)).toFixed(3),
        movementType: MovementType.SALE,
        sale,
      }),
    );

    await this.stockMovementsRepository.save(movements);
  }

  async createForPurchase(
    purchase: Purchase,
    items: PurchaseItem[],
  ): Promise<void> {
    const movements = items.map((item) =>
      this.stockMovementsRepository.create({
        product: item.productUnit.product,
        quantity: item.quantity,
        movementType: MovementType.PURCHASE,
        purchase,
      }),
    );

    await this.stockMovementsRepository.save(movements);
  }
}
