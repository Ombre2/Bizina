import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/types/pagination-params.type';
import { SaleWithItemsResponseDto } from 'src/types/type';
import { In, Repository } from 'typeorm';
import { ProductUnit } from '../product-units/entities/product-unit.entity';
import { ProductUnitsService } from '../product-units/product-units.service';
import { Sale } from '../sales/entities/sale.entity';
import { CreateSaleItemDto } from './dto/create-sale-item.dto';
import { SaleItem } from './entities/sale-item.entity';

@Injectable()
export class SaleItemsService {
  constructor(
    @InjectRepository(SaleItem)
    private readonly saleItemsRepository: Repository<SaleItem>,

    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,

    private readonly productUnitsService: ProductUnitsService,
  ) {}

  async create(createSaleItemDto: CreateSaleItemDto): Promise<SaleItem> {
    const sale = await this.salesRepository.findOne({
      where: { id: createSaleItemDto.saleId },
    });

    if (!sale) {
      throw new NotFoundException(
        `Vente avec l'identifiant ${createSaleItemDto.saleId} introuvable`,
      );
    }

    const productUnit = await this.productUnitsService.findOne(
      createSaleItemDto.productUnitId,
    );

    const saleItem = this.saleItemsRepository.create({
      sale,
      productUnit,
      quantity: createSaleItemDto.quantity,
      unitPrice: createSaleItemDto.unitPrice,
      totalPrice: (
        Number(createSaleItemDto.quantity) * Number(createSaleItemDto.unitPrice)
      ).toFixed(2),
    });

    const savedSaleItem = await this.saleItemsRepository.save(saleItem);

    return this.findOne(savedSaleItem.id);
  }

  async createMany(
    createSaleItemDtos: CreateSaleItemDto[],
  ): Promise<SaleItem[]> {
    if (!createSaleItemDtos.length) {
      return [];
    }

    const saleIds = [...new Set(createSaleItemDtos.map((dto) => dto.saleId))];
    const productUnitIds = [
      ...new Set(createSaleItemDtos.map((dto) => dto.productUnitId)),
    ];

    const productUnitsRepository =
      this.saleItemsRepository.manager.getRepository(ProductUnit);

    const [sales, productUnits] = await Promise.all([
      this.salesRepository.find({ where: { id: In(saleIds) } }),
      productUnitsRepository.find({
        where: { id: In(productUnitIds) },
        relations: { product: true, unit: true },
      }),
    ]);

    const salesById = new Map(sales.map((sale) => [sale.id, sale]));
    const productUnitsById = new Map(productUnits.map((pu) => [pu.id, pu]));

    const itemsToCreate = createSaleItemDtos.map((dto) => {
      const sale = salesById.get(dto.saleId);

      if (!sale) {
        throw new NotFoundException(
          `Vente avec l'identifiant ${dto.saleId} introuvable`,
        );
      }

      const productUnit = productUnitsById.get(dto.productUnitId);

      if (!productUnit) {
        throw new NotFoundException(
          `Unité produit avec l'identifiant ${dto.productUnitId} introuvable`,
        );
      }

      return this.saleItemsRepository.create({
        sale,
        productUnit,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        totalPrice: (Number(dto.quantity) * Number(dto.unitPrice)).toFixed(2),
      });
    });

    const savedItems = await this.saleItemsRepository.save(itemsToCreate);
    const savedIds = savedItems.map((item) => item.id);

    return this.saleItemsRepository.find({
      where: { id: In(savedIds) },
      relations: {
        sale: true,
        productUnit: {
          product: true,
          unit: true,
        },
      },
    });
  }

  async findAll({
    page = 1,
    limit = 100,
  }: Partial<PaginationParams> = {}): Promise<PaginatedResult<SaleItem>> {
    page = Math.max(1, Number(page));
    limit = Math.max(1, Math.min(200, Number(limit)));
    const [data, total] = await this.saleItemsRepository.findAndCount({
      relations: {
        sale: true,
        productUnit: {
          product: true,
          unit: true,
        },
      },
      order: {
        id: 'DESC',
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

  async findOne(id: string): Promise<SaleItem> {
    const saleItem = await this.saleItemsRepository.findOne({
      where: { id },
      relations: {
        sale: true,
        productUnit: {
          product: true,
          unit: true,
        },
      },
    });

    if (!saleItem) {
      throw new NotFoundException(
        `Ligne de vente avec l'identifiant ${id} introuvable`,
      );
    }

    return saleItem;
  }

  async findBySale(saleId: string): Promise<SaleWithItemsResponseDto> {
    const sale = await this.salesRepository.findOne({
      where: { id: saleId },
      relations: {
        customer: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(
        `Vente avec l'identifiant ${saleId} introuvable`,
      );
    }
    const saleItems = await this.saleItemsRepository.find({
      where: { sale: { id: sale.id } },
      relations: {
        productUnit: {
          product: true,
          unit: true,
        },
      },
      order: {
        id: 'DESC',
      },
    });
    return {
      sale: sale,
      saleItems: saleItems,
    };
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.saleItemsRepository.delete({ id });
  }
}
