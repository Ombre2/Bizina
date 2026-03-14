import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    return this.productsRepository.save(product);
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
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Produit avec l'identifiant ${id} introuvable`,
      );
    }

    return product;
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
