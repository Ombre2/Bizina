import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const normalizedName = createSupplierDto.name.trim();
    const normalizedPhone = createSupplierDto.phone?.trim();

    if (normalizedPhone) {
      const duplicate = await this.suppliersRepository
        .createQueryBuilder('supplier')
        .where('LOWER(supplier.name) = LOWER(:name)', { name: normalizedName })
        .andWhere('supplier.phone = :phone', { phone: normalizedPhone })
        .getOne();

      if (duplicate) {
        throw new ConflictException(
          'Un fournisseur avec le même nom et le même téléphone existe déjà',
        );
      }
    }

    const supplier = this.suppliersRepository.create({
      ...createSupplierDto,
      name: normalizedName,
      phone: normalizedPhone ?? null,
    });
    return this.suppliersRepository.save(supplier);
  }

  findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOneBy({ id });

    if (!supplier) {
      throw new NotFoundException(
        `Fournisseur avec l'identifiant ${id} introuvable`,
      );
    }

    return supplier;
  }

  async update(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const currentSupplier = await this.findOne(id);

    const normalizedName =
      updateSupplierDto.name !== undefined
        ? updateSupplierDto.name.trim()
        : currentSupplier.name;
    const normalizedPhone =
      updateSupplierDto.phone !== undefined
        ? (updateSupplierDto.phone?.trim() ?? null)
        : currentSupplier.phone;

    if (normalizedPhone) {
      const duplicate = await this.suppliersRepository
        .createQueryBuilder('supplier')
        .where('supplier.id <> :id', { id })
        .andWhere('LOWER(supplier.name) = LOWER(:name)', {
          name: normalizedName,
        })
        .andWhere('supplier.phone = :phone', { phone: normalizedPhone })
        .getOne();

      if (duplicate) {
        throw new ConflictException(
          'Un fournisseur avec le même nom et le même téléphone existe déjà',
        );
      }
    }

    const supplier = await this.suppliersRepository.preload({
      id,
      ...updateSupplierDto,
      name: normalizedName,
      phone: normalizedPhone,
    });

    if (!supplier) {
      throw new NotFoundException(
        `Fournisseur avec l'identifiant ${id} introuvable`,
      );
    }

    return this.suppliersRepository.save(supplier);
  }

  async remove(id: string): Promise<void> {
    const result = await this.suppliersRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(
        `Fournisseur avec l'identifiant ${id} introuvable`,
      );
    }
  }
}
