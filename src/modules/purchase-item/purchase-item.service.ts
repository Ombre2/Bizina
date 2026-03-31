import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PurchaseWithItemsResponseDto } from 'src/types/type';
import { In, Repository } from 'typeorm';
import { ProductUnit } from '../product-units/entities/product-unit.entity';
import { ProductUnitsService } from '../product-units/product-units.service';
import { Purchase } from '../purchase/entities/purchase.entity';
import { CreatePurchaseItemDto } from './dto/create-purchase-item.dto';
import { PurchaseItem } from './entities/purchase-item.entity';

@Injectable()
export class PurchaseItemService {
  constructor(
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemsRepository: Repository<PurchaseItem>,
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
    private readonly productUnitsService: ProductUnitsService,
  ) {}

  async create(
    createPurchaseItemDto: CreatePurchaseItemDto,
  ): Promise<PurchaseItem> {
    const purchase = await this.purchasesRepository.findOne({
      where: { id: createPurchaseItemDto.purchaseId },
    });

    if (!purchase) {
      throw new NotFoundException(
        `Achat avec l'identifiant ${createPurchaseItemDto.purchaseId} introuvable`,
      );
    }
    const productUnit = await this.productUnitsService.findOne(
      createPurchaseItemDto.productUnitId,
    );

    const purchaseItem = this.purchaseItemsRepository.create({
      purchase,
      productUnit,
      quantity: createPurchaseItemDto.quantity,
      unitPrice: createPurchaseItemDto.unitPrice,
      totalPrice: (
        Number(createPurchaseItemDto.quantity) *
        Number(createPurchaseItemDto.unitPrice)
      ).toFixed(2),
    });

    const savedPurchaseItem =
      await this.purchaseItemsRepository.save(purchaseItem);

    return this.findOne(savedPurchaseItem.id);
  }

  async createMany(
    createPurchaseItemDtos: CreatePurchaseItemDto[],
  ): Promise<PurchaseItem[]> {
    if (!createPurchaseItemDtos.length) {
      return [];
    }

    const purchaseIds = [
      ...new Set(createPurchaseItemDtos.map((dto) => dto.purchaseId)),
    ];
    const productUnitIds = [
      ...new Set(createPurchaseItemDtos.map((dto) => dto.productUnitId)),
    ];

    const productUnitsRepository =
      this.purchaseItemsRepository.manager.getRepository(ProductUnit);

    const [purchases, productUnits] = await Promise.all([
      this.purchasesRepository.find({ where: { id: In(purchaseIds) } }),
      productUnitsRepository.find({
        where: { id: In(productUnitIds) },
        relations: { product: true, unit: true },
      }),
    ]);

    const purchasesById = new Map(
      purchases.map((purchase) => [purchase.id, purchase]),
    );
    const productUnitsById = new Map(productUnits.map((pu) => [pu.id, pu]));

    const itemsToCreate = createPurchaseItemDtos.map((dto) => {
      const purchase = purchasesById.get(dto.purchaseId);

      if (!purchase) {
        throw new NotFoundException(
          `Achat avec l'identifiant ${dto.purchaseId} introuvable`,
        );
      }

      const productUnit = productUnitsById.get(dto.productUnitId);

      if (!productUnit) {
        throw new NotFoundException(
          `Unité produit avec l'identifiant ${dto.productUnitId} introuvable`,
        );
      }

      return this.purchaseItemsRepository.create({
        purchase,
        productUnit,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        totalPrice: (Number(dto.quantity) * Number(dto.unitPrice)).toFixed(2),
      });
    });

    const savedItems = await this.purchaseItemsRepository.save(itemsToCreate);
    const savedIds = savedItems.map((item) => item.id);

    return this.purchaseItemsRepository.find({
      where: { id: In(savedIds) },
      relations: {
        purchase: true,
        productUnit: {
          product: true,
          unit: true,
        },
      },
    });
  }

  findAll(): Promise<PurchaseItem[]> {
    return this.purchaseItemsRepository.find({
      relations: {
        purchase: true,
        productUnit: {
          product: true,
          unit: true,
        },
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<PurchaseItem> {
    const purchase = await this.purchasesRepository.findOne({
      where: { id: id },
      relations: {
        supplier: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException(`Achat avec l'identifiant ${id} introuvable`);
    }

    const purchaseItem = await this.purchaseItemsRepository.findOne({
      where: { purchase: { id: purchase.id } },
      relations: {
        productUnit: {
          product: true,
          unit: true,
        },
      },
    });

    if (!purchaseItem) {
      throw new NotFoundException(
        `Ligne d'achat avec l'identifiant ${id} introuvable`,
      );
    }

    return purchaseItem;
  }

  async findByPurchase(id: string): Promise<PurchaseWithItemsResponseDto> {
    const purchase = await this.purchasesRepository.findOne({
      where: { id: id },
      relations: {
        supplier: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException(`Achat avec l'identifiant ${id} introuvable`);
    }

    const purchaseItem = await this.purchaseItemsRepository.find({
      where: { purchase: { id: purchase.id } },
      relations: {
        productUnit: {
          product: true,
          unit: true,
        },
      },
    });

    if (!purchaseItem) {
      throw new NotFoundException(
        `Ligne d'achat avec l'identifiant ${id} introuvable`,
      );
    }

    return {
      purchase,
      purchaseItems: purchaseItem,
    };
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.purchaseItemsRepository.delete({ id });
  }
}
