import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/types/pagination-params.type';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const unit = this.unitsRepository.create(createUnitDto);
    return this.unitsRepository.save(unit);
  }

  async findAll({
    page = 1,
    limit = 100,
  }: Partial<PaginationParams> = {}): Promise<PaginatedResult<Unit>> {
    page = Math.max(1, Number(page));
    limit = Math.max(1, Math.min(200, Number(limit)));
    const [data, total] = await this.unitsRepository.findAndCount({
      order: {
        name: 'ASC',
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

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitsRepository.findOneBy({ id });

    if (!unit) {
      throw new NotFoundException(`Unité avec l'identifiant ${id} introuvable`);
    }

    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.unitsRepository.preload({
      id,
      ...updateUnitDto,
    });

    if (!unit) {
      throw new NotFoundException(`Unité avec l'identifiant ${id} introuvable`);
    }

    return this.unitsRepository.save(unit);
  }

  async remove(id: string): Promise<void> {
    const result = await this.unitsRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(`Unité avec l'identifiant ${id} introuvable`);
    }
  }
}
