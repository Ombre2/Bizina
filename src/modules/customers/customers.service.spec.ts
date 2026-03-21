import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';

const mockCustomer: Customer = {
  id: 'cust-1',
  name: 'Client A',
  phone: '0612345678',
  address: '123 rue',
  createdAt: new Date(),
};

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
};

describe('CustomersService', () => {
  let service: CustomersService;
  let repo: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            preload: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CustomersService);
    repo = module.get(getRepositoryToken(Customer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockCustomer);
      repo.save.mockResolvedValue(mockCustomer);

      const result = await service.create({
        name: 'Client A',
        phone: '0612345678',
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should throw ConflictException on duplicate name+phone', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockCustomer);

      await expect(
        service.create({ name: 'Client A', phone: '0612345678' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should skip duplicate check if no phone', async () => {
      repo.create.mockReturnValue(mockCustomer);
      repo.save.mockResolvedValue(mockCustomer);

      const result = await service.create({ name: 'Client A' });
      expect(result).toEqual(mockCustomer);
      expect(repo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all customers ordered by name', async () => {
      repo.find.mockResolvedValue([mockCustomer]);
      const result = await service.findAll();
      expect(result).toEqual([mockCustomer]);
      expect(repo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      repo.findOneBy.mockResolvedValue(mockCustomer);
      expect(await service.findOne('cust-1')).toEqual(mockCustomer);
    });

    it('should throw NotFoundException', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the customer', async () => {
      repo.findOneBy.mockResolvedValue(mockCustomer);
      mockQueryBuilder.getOne.mockResolvedValue(null);
      const updated = { ...mockCustomer, name: 'New Name' };
      repo.preload.mockResolvedValue(updated);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('cust-1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });

    it('should throw ConflictException on duplicate during update', async () => {
      repo.findOneBy.mockResolvedValue(mockCustomer);
      mockQueryBuilder.getOne.mockResolvedValue({
        ...mockCustomer,
        id: 'cust-2',
      });

      await expect(
        service.update('cust-1', { name: 'Client A', phone: '0612345678' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if preload fails', async () => {
      repo.findOneBy.mockResolvedValue(mockCustomer);
      mockQueryBuilder.getOne.mockResolvedValue(null);
      repo.preload.mockResolvedValue(undefined);

      await expect(service.update('nope', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete the customer', async () => {
      repo.delete.mockResolvedValue({ affected: 1, raw: {} });
      await expect(service.remove('cust-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException', async () => {
      repo.delete.mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
