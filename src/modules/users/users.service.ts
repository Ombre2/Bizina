import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/types/pagination-params.type';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll({
    page = 1,
    limit = 100,
  }: Partial<PaginationParams> = {}): Promise<PaginatedResult<User>> {
    page = Math.max(1, Number(page));
    limit = Math.max(1, Math.min(200, Number(limit)));
    const [data, total] = await this.usersRepository.findAndCount({
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

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.preload({ id, ...updateUserDto });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.usersRepository.save(user);
  }

  async bumpSessionNonce(userId: string): Promise<number> {
    const user = await this.findOne(userId);
    // Use second precision to avoid DB timestamp precision mismatch.
    const nowSeconds = Math.floor(Date.now() / 1000);
    user.lastLogin = new Date(nowSeconds * 1000);
    const saved = await this.usersRepository.save(user);
    return Math.floor((saved.lastLogin?.getTime() ?? 0) / 1000);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
