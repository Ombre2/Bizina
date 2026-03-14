import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase } from './entities/purchase.entity';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    const supplier = await this.suppliersRepository.findOneBy({
      id: createPurchaseDto.supplierId,
    });

    if (!supplier) {
      throw new NotFoundException(
        `Fournisseur avec l'identifiant ${createPurchaseDto.supplierId} introuvable`,
      );
    }

    const purchase = this.purchasesRepository.create({
      supplier,
      purchaseDate: createPurchaseDto.purchaseDate,
      totalAmount: createPurchaseDto.totalAmount,
    });

    const savedPurchase = await this.purchasesRepository.save(purchase);

    return this.findOne(savedPurchase.id);
  }

  findAll(): Promise<Purchase[]> {
    return this.purchasesRepository.find({
      relations: {
        supplier: true,
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
      const supplier = await this.suppliersRepository.findOneBy({
        id: updatePurchaseDto.supplierId,
      });

      if (!supplier) {
        throw new NotFoundException(
          `Fournisseur avec l'identifiant ${updatePurchaseDto.supplierId} introuvable`,
        );
      }

      purchase.supplier = supplier;
    }

    if (updatePurchaseDto.purchaseDate !== undefined) {
      purchase.purchaseDate = updatePurchaseDto.purchaseDate;
    }

    if (updatePurchaseDto.totalAmount !== undefined) {
      purchase.totalAmount = updatePurchaseDto.totalAmount;
    }

    return this.purchasesRepository.save(purchase);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    const result = await this.purchasesRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(`Achat avec l'identifiant ${id} introuvable`);
    }
  }
}
