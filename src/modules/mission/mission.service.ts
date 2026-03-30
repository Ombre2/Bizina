import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MissionWithTotals } from 'src/type/type';
import { Repository } from 'typeorm';
import { Expense } from '../expenses/entities/expense.entity';
import { Purchase } from '../purchase/entities/purchase.entity';
import { Sale } from '../sales/entities/sale.entity';
import { UsersService } from '../users/users.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { Mission } from './entities/mission.entity';

@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    private readonly userService: UsersService,
  ) {}

  async create(createMissionDto: CreateMissionDto) {
    const user = await this.userService.findByUsername(
      createMissionDto.userName,
    );

    const mission = this.missionRepository.create({
      title: createMissionDto.title,
      assignedTo: user!,
      initialCash: createMissionDto.initialCash,
      status: createMissionDto.status,
    });

    return this.missionRepository.save(mission);
  }

  findAll() {
    return this.missionRepository.find({
      relations: ['assignedTo'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<MissionWithTotals> {
    const mission = await this.missionRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'purchases', 'sales', 'expenses'],
    });
    if (!mission) {
      throw new NotFoundException(`Mission with id ${id} not found`);
    }
    // Calcul des totaux
    const totalPurchases =
      mission.purchases?.reduce((sum: number, p: Purchase) => {
        return sum + Number(p.totalAmount ?? 0);
      }, 0) || 0;

    const totalSales =
      mission.sales?.reduce((sum: number, s: Sale) => {
        return sum + Number(s.totalAmount ?? 0);
      }, 0) || 0;

    // Calcul du reste
    const totalExpenses =
      mission.expenses?.reduce((sum: number, e: Expense) => {
        return sum + Number(e.amount ?? 0);
      }, 0) || 0;

    const remainingCash =
      Number(mission.initialCash) - totalPurchases + totalSales - totalExpenses;

    return {
      ...mission,
      totalPurchases,
      totalSales,
      remainingCash,
      totalExpenses,
    };
  }

  async update(
    id: string,
    updateMissionDto: UpdateMissionDto,
  ): Promise<Mission> {
    // 1. Vérifier que la mission existe
    const mission = await this.missionRepository.findOne({
      where: { id },
    });

    if (!mission) {
      throw new NotFoundException(`Mission with id ${id} not found`);
    }

    // 2. Gérer la relation assignedTo (user)
    if (updateMissionDto.userName !== undefined) {
      const user = await this.userService.findByUsername(
        updateMissionDto.userName,
      );
      mission.assignedTo = user!; // user déjà validé dans service
    }

    // 3. Mise à jour simple des champs
    if (updateMissionDto.title !== undefined) {
      mission.title = updateMissionDto.title;
    }

    if (updateMissionDto.initialCash !== undefined) {
      mission.initialCash = updateMissionDto.initialCash;
    }

    if (updateMissionDto.status !== undefined) {
      mission.status = updateMissionDto.status;
    }

    // 4. Sauvegarde
    return await this.missionRepository.save(mission);
  }

  async remove(id: string) {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) throw new NotFoundException('Mission not found');
    await this.missionRepository.remove(mission);
    return { deleted: true };
  }
}
