import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethod } from './entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodsRepository: Repository<PaymentMethod>,
  ) {}

  async create(
    createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const normalizedName = createPaymentMethodDto.name.trim();

    const duplicate = await this.paymentMethodsRepository
      .createQueryBuilder('pm')
      .where('LOWER(pm.name) = LOWER(:name)', { name: normalizedName })
      .getOne();

    if (duplicate) {
      throw new ConflictException(
        'Un mode de paiement avec le même nom existe déjà',
      );
    }

    const paymentMethod = this.paymentMethodsRepository.create({
      name: normalizedName,
    });

    return this.paymentMethodsRepository.save(paymentMethod);
  }

  findAll(): Promise<PaymentMethod[]> {
    return this.paymentMethodsRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodsRepository.findOneBy({
      id,
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        `Mode de paiement avec l'identifiant ${id} introuvable`,
      );
    }

    return paymentMethod;
  }

  async update(
    id: string,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const normalizedName = updatePaymentMethodDto.name?.trim();

    if (normalizedName) {
      const duplicate = await this.paymentMethodsRepository
        .createQueryBuilder('pm')
        .where('pm.id <> :id', { id })
        .andWhere('LOWER(pm.name) = LOWER(:name)', { name: normalizedName })
        .getOne();

      if (duplicate) {
        throw new ConflictException(
          'Un mode de paiement avec le même nom existe déjà',
        );
      }
    }

    const paymentMethod = await this.paymentMethodsRepository.preload({
      id,
      ...(normalizedName && { name: normalizedName }),
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        `Mode de paiement avec l'identifiant ${id} introuvable`,
      );
    }

    return this.paymentMethodsRepository.save(paymentMethod);
  }

  async remove(id: string): Promise<void> {
    const result = await this.paymentMethodsRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(
        `Mode de paiement avec l'identifiant ${id} introuvable`,
      );
    }
  }
}
