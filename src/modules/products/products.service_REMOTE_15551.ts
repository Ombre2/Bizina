import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/types/pagination-params.type';
import { ILike, Repository } from 'typeorm';
import { ProductUnitsService } from '../product-units/product-units.service';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';
import { UnitsService } from '../units/units.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private readonly stockMovementsRepository: Repository<StockMovement>,
    private readonly unitsService: UnitsService,
    private readonly productUnitsService: ProductUnitsService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const baseUnit = await this.unitsService.findOne(
      createProductDto.baseUnitId,
    );

    const product = this.productsRepository.create({
      name: createProductDto.name,
      description: createProductDto.description,
      baseUnit,
    });

    const savedProduct = await this.productsRepository.save(product);
    const hasBaseUnitInPayload = createProductDto.productUnit.some(
      (item) => item.unitId === savedProduct.baseUnit.id,
    );
    const relatedUnits = hasBaseUnitInPayload
      ? createProductDto.productUnit
      : [
          ...createProductDto.productUnit,
          {
            unitId: savedProduct.baseUnit.id,
            conversionToBase: '1',
          },
        ];

    await this.productUnitsService.createMany(savedProduct.id, relatedUnits);

    return this.findOne(savedProduct.id);
  }

  async findAll({
    page,
    limit,
    searchQuery = '',
  }: PaginationParams): Promise<PaginatedResult<Product>> {
    // Sécurise les valeurs
    page = Math.max(1, Number(page));
    limit = Math.max(1, Number(limit));

    const [data, total] = await this.productsRepository.findAndCount({
      where: searchQuery
        ? [
            { name: ILike(`%${searchQuery}%`) },
            { description: ILike(`%${searchQuery}%`) },
          ]
        : {},
      relations: { baseUnit: true },
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const hasNextPage = page < Math.ceil(total / limit);

    return { data, total, hasNextPage, hasPreviousPage: page > 1 };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        baseUnit: true,
        productUnits: {
          unit: true,
        },
        stockMovements: true,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Produit avec l'identifiant ${id} introuvable`,
      );
    }

    return { ...product };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.baseUnitId) {
      const baseUnit = await this.unitsService.findOne(
        updateProductDto.baseUnitId,
      );

      product.baseUnit = baseUnit;
    }

    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }

    if (updateProductDto.description !== undefined) {
      product.description = updateProductDto.description;
    }

    await this.productsRepository.save(product);

    if (updateProductDto.productUnit) {
      // On utilise la méthode createMany qui gère insert/update pour chaque unité
      const currentUnits = await this.productUnitsService.createMany(
        id,
        updateProductDto.productUnit,
      );

      const payloadUnitIds = new Set(
        updateProductDto.productUnit.map((u) => u.unitId),
      );
      const toDelete = currentUnits.filter(
        (item) => !payloadUnitIds.has(item.unit.id),
      );
      if (toDelete.length > 0) {
        for (const item of toDelete) {
          await this.productUnitsService.remove(item.id);
        }
      }
    }

    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    const result = await this.productsRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(
        `Produit avec l'identifiant ${id} introuvable`,
      );
    }
  }

  async getStockLevel(
    id: string,
  ): Promise<{ productId: string; productName: string; quantity: string }> {
    const product = await this.findOne(id);

    const result = await this.stockMovementsRepository
      .createQueryBuilder('sm')
      .select('COALESCE(SUM(sm.quantity), 0)', 'total')
      .where('sm.product_id = :productId', { productId: id })
      .getRawOne<{ total: string }>();

    return {
      productId: product.id,
      productName: product.name,
      quantity: Number(result?.total ?? 0).toFixed(3),
    };
  }
}
