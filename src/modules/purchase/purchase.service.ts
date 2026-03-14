import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePurchaseItemDto } from '../purchase-item/dto/create-purchase-item.dto';
import { PurchaseItemService } from '../purchase-item/purchase-item.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase } from './entities/purchase.entity';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
    private readonly purchaseItemService: PurchaseItemService,
    private readonly suppliersService: SuppliersService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    const supplier = await this.suppliersService.findOne(
      createPurchaseDto.supplierId,
    );

    const purchase = this.purchasesRepository.create({
      supplier,
      purchaseDate: createPurchaseDto.purchaseDate,
      totalAmount: '0.00',
    });

    const savedPurchase = await this.purchasesRepository.save(purchase);
    const purchaseItemsPayload: CreatePurchaseItemDto[] =
      createPurchaseDto.items.map((item) => ({
        purchaseId: savedPurchase.id,
        productUnitId: item.productUnitId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

    const createdItems =
      await this.purchaseItemService.createMany(purchaseItemsPayload);

    savedPurchase.totalAmount = createdItems
      .reduce((sum, item) => sum + Number(item.totalPrice), 0)
      .toFixed(2);
    await this.purchasesRepository.save(savedPurchase);

    return this.findOne(savedPurchase.id);
  }

  findAll(): Promise<Purchase[]> {
    return this.purchasesRepository.find({
      relations: {
        supplier: true,
        purchaseItems: {
          productUnit: {
            product: true,
            unit: true,
          },
        },
      },
      order: {
        purchaseDate: 'DESC',
      },
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
