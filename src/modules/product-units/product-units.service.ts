import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/types/pagination-params.type';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { UnitsService } from '../units/units.service';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { ProductUnit } from './entities/product-unit.entity';

type ProductUnitCreateManyInput = {
  unitId: string;
  conversionToBase: string;
};

@Injectable()
export class ProductUnitsService {
  constructor(
    @InjectRepository(ProductUnit)
    private readonly productUnitsRepository: Repository<ProductUnit>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly unitsService: UnitsService,
  ) {}

  private async findProductOrThrow(productId: string): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id: productId });

    if (!product) {
      throw new NotFoundException(
        `Produit avec l'identifiant ${productId} introuvable`,
      );
    }

    return product;
  }

  async create(
    createProductUnitDto: CreateProductUnitDto,
  ): Promise<ProductUnit> {
    const productId = String(createProductUnitDto.productId);
    const unitId = String(createProductUnitDto.unitId);
    const conversionToBase = String(createProductUnitDto.conversionToBase);

    const product = await this.findProductOrThrow(productId);
    const unit = await this.unitsService.findOne(unitId);

    const productUnit = this.productUnitsRepository.create({
      product,
      unit,
      conversionToBase,
    });

    return this.productUnitsRepository.save(productUnit);
  }

  async createMany(
    productId: string,
    items: ProductUnitCreateManyInput[],
  ): Promise<ProductUnit[]> {
    const product = await this.findProductOrThrow(productId);

    if (items.length === 0) {
      return [];
    }

    // Keep the last value for duplicated unitIds in payload.
    const itemByUnitId = new Map<string, string>();
    for (const item of items) {
      itemByUnitId.set(String(item.unitId), String(item.conversionToBase));
    }
    const normalizedUnitIds = [...itemByUnitId.keys()];

    const units = await Promise.all(
      normalizedUnitIds.map((unitId) => this.unitsService.findOne(unitId)),
    );

    const existing = await this.productUnitsRepository.find({
      where: { product: { id: product.id } },
      relations: { unit: true },
    });
    const existingUnitIds = new Set(existing.map((item) => item.unit.id));

    const toCreate = units
      .filter((unit) => !existingUnitIds.has(unit.id))
      .map((unit) =>
        this.productUnitsRepository.create({
          product,
          unit,
          conversionToBase: itemByUnitId.get(unit.id) ?? '1',
        }),
      );

    if (toCreate.length > 0) {
      await this.productUnitsRepository.save(toCreate);
    }

    // Update conversion for existing product units when provided in payload.
    const toUpdate = existing.filter((item) => itemByUnitId.has(item.unit.id));

    if (toUpdate.length > 0) {
      for (const item of toUpdate) {
        item.conversionToBase =
          itemByUnitId.get(item.unit.id) ?? item.conversionToBase;
      }
      await this.productUnitsRepository.save(toUpdate);
    }

    return this.productUnitsRepository.find({
      where: { product: { id: product.id } },
      relations: {
        product: true,
        unit: true,
      },
      order: {
        conversionToBase: 'ASC',
      },
    });
  }

  async findAll({
    page = 1,
    limit = 100,
  }: Partial<PaginationParams> = {}): Promise<PaginatedResult<ProductUnit>> {
    page = Math.max(1, Number(page));
    limit = Math.max(1, Math.min(200, Number(limit)));
    const [data, total] = await this.productUnitsRepository.findAndCount({
      relations: {
        product: true,
        unit: true,
      },
      order: {
        conversionToBase: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    };
  }

  async findOne(id: string): Promise<ProductUnit> {
    const productUnit = await this.productUnitsRepository.findOne({
      where: { id },
      relations: {
        product: {
          baseUnit: true,
        },
        unit: true,
      },
    });

    if (!productUnit) {
      throw new NotFoundException(
        `Association produit/unité avec l'identifiant ${id} introuvable`,
      );
    }

    return productUnit;
  }

  async findOneByProductId(id: string): Promise<ProductUnit> {
    const productUnit = await this.productUnitsRepository.findOne({
      where: { product: { id } },
      relations: {
        product: true,
        unit: true,
      },
    });

    if (!productUnit) {
      throw new NotFoundException(
        `Association produit/unité pour le produit avec l'identifiant ${id} introuvable`,
      );
    }

    return productUnit;
  }

  async findByProductId(id: string): Promise<ProductUnit[]> {
    const productUnits = await this.productUnitsRepository.find({
      where: { product: { id } },
      relations: {
        product: true,
        unit: true,
      },
    });

    if (!productUnits || productUnits.length === 0) {
      throw new NotFoundException(
        `Association produit/unité pour le produit avec l'identifiant ${id} introuvable`,
      );
    }

    return productUnits;
  }

  async update(
    id: string,
    updateProductUnitDto: UpdateProductUnitDto,
  ): Promise<ProductUnit> {
    const productUnit = await this.findOne(id);

    if (updateProductUnitDto.productId) {
      const productId = String(updateProductUnitDto.productId);
      productUnit.product = await this.findProductOrThrow(productId);
    }

    if (updateProductUnitDto.unitId) {
      const unitId = String(updateProductUnitDto.unitId);
      productUnit.unit = await this.unitsService.findOne(unitId);
    }

    if (updateProductUnitDto.conversionToBase !== undefined) {
      productUnit.conversionToBase = String(
        updateProductUnitDto.conversionToBase,
      );
    }

    return this.productUnitsRepository.save(productUnit);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    const result = await this.productUnitsRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(
        `Association produit/unité avec l'identifiant ${id} introuvable`,
      );
    }
  }
}
