import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  findAll(): Promise<Unit[]> {
    return this.unitsRepository.find({
      order: {
        name: 'ASC',
      },
    });
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
