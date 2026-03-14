import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductUnitsService } from '../product-units/product-units.service';
import { UnitsService } from '../units/units.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
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

  findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: {
        baseUnit: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        baseUnit: true,
        productUnits: true,
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

    return this.productsRepository.save(product);
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
}
