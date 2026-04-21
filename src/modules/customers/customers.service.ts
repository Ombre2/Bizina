import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from 'src/types/pagination-params.type';
import { FilterGlobalDto } from 'src/utils/filter.global.dto';
import { ILike, Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const normalizedName = createCustomerDto.name.trim();
    const normalizedPhone = createCustomerDto.phone?.trim();

    if (normalizedName) {
      const duplicate = await this.customersRepository
        .createQueryBuilder('customer')
        .where('LOWER(customer.name) = LOWER(:name)', { name: normalizedName })
        .getOne();

      if (duplicate) {
        throw new ConflictException(
          'Un client avec le même nom existe déjà',
        );
      }
    }

    const customer = this.customersRepository.create({
      ...createCustomerDto,
      name: normalizedName,
      phone: normalizedPhone ?? null,
    });

    return this.customersRepository.save(customer);
  }

  async findAll(filter: FilterGlobalDto): Promise<PaginatedResult<Customer>> {
    const search = filter.searchQuery?.trim();

    const [customers, total] = await this.customersRepository.findAndCount({
      where: search
        ? [
            { name: ILike(`%${search}%`) },
            { phone: ILike(`%${search}%`) },
            { address: ILike(`%${search}%`) },
          ]
        : undefined,
      order: {
        name: 'ASC',
      },
      skip: (filter.page - 1) * filter.limit,
      take: filter.limit,
    });

    const hasNextPage = filter.page < Math.ceil(total / filter.limit);

    return {
      data: customers,
      total,
      hasNextPage,
      hasPreviousPage: filter.page > 1,
    };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOneBy({ id });

    if (!customer) {
      throw new NotFoundException(
        `Client avec l'identifiant ${id} introuvable`,
      );
    }

    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const currentCustomer = await this.findOne(id);

    const normalizedName =
      updateCustomerDto.name !== undefined
        ? updateCustomerDto.name.trim()
        : currentCustomer.name;
    const normalizedPhone =
      updateCustomerDto.phone !== undefined
        ? (updateCustomerDto.phone?.trim() ?? null)
        : currentCustomer.phone;

    if (normalizedPhone) {
      const duplicate = await this.customersRepository
        .createQueryBuilder('customer')
        .where('customer.id <> :id', { id })
        .andWhere('LOWER(customer.name) = LOWER(:name)', {
          name: normalizedName,
        })
        .andWhere('customer.phone = :phone', { phone: normalizedPhone })
        .getOne();

      if (duplicate) {
        throw new ConflictException(
          'Un client avec le même nom existe déjà',
        );
      }
    }

    const customer = await this.customersRepository.preload({
      id,
      ...updateCustomerDto,
      name: normalizedName,
      phone: normalizedPhone,
    });

    if (!customer) {
      throw new NotFoundException(
        `Client avec l'identifiant ${id} introuvable`,
      );
    }

    return this.customersRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const result = await this.customersRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(
        `Client avec l'identifiant ${id} introuvable`,
      );
    }
  }
}
