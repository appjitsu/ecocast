import { ConflictException, RequestTimeoutException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { DataSource, QueryRunner } from 'typeorm';
import { UsersCreateManyProvider } from './users-create-many.provider';

describe('UsersCreateManyProvider', () => {
  let provider: UsersCreateManyProvider;
  let dataSource: DataSource;
  let hashingProvider: HashingProvider;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      isTransactionActive: true,
      manager: {
        create: jest.fn(),
        save: jest.fn(),
      },
    } as unknown as QueryRunner;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersCreateManyProvider,
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
        {
          provide: HashingProvider,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<UsersCreateManyProvider>(UsersCreateManyProvider);
    dataSource = module.get<DataSource>(DataSource);
    hashingProvider = module.get<HashingProvider>(HashingProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('createMany', () => {
    const createManyUsersDto = {
      users: [
        {
          email: 'test1@example.com',
          password: 'password123',
          firstName: 'Test1',
          lastName: 'User1',
        },
        {
          email: 'test2@example.com',
          password: 'password123',
          firstName: 'Test2',
          lastName: 'User2',
        },
      ],
    };

    it('should create multiple users successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const mockUsers = createManyUsersDto.users.map((user, index) => ({
        id: index + 1,
        email: user.email,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        casts: [],
      }));

      jest
        .spyOn(hashingProvider, 'hashPassword')
        .mockResolvedValue(hashedPassword);
      jest
        .spyOn(queryRunner.manager, 'create')
        .mockImplementation((entity: any, data: any) => ({
          id: mockUsers.length,
          ...data,
          password: hashedPassword,
          casts: [],
        }));
      jest
        .spyOn(queryRunner.manager, 'save')
        .mockImplementation((entity: any) => Promise.resolve(entity));

      const result = await provider.createMany(createManyUsersDto);

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(hashingProvider.hashPassword).toHaveBeenCalledTimes(2);
      expect(queryRunner.manager.create).toHaveBeenCalledTimes(2);
      expect(queryRunner.manager.save).toHaveBeenCalledTimes(2);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe(createManyUsersDto.users[0].email);
      expect(result[1].email).toBe(createManyUsersDto.users[1].email);
    });

    it('should throw RequestTimeoutException on database connection error', async () => {
      jest
        .spyOn(queryRunner, 'connect')
        .mockRejectedValue(new Error('Connection failed'));

      await expect(provider.createMany(createManyUsersDto)).rejects.toThrow(
        RequestTimeoutException,
      );
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should throw ConflictException and rollback on save error', async () => {
      const error = new Error('Duplicate entry');
      const hashedPassword = 'hashedPassword123';

      jest
        .spyOn(hashingProvider, 'hashPassword')
        .mockResolvedValue(hashedPassword);
      jest
        .spyOn(queryRunner.manager, 'create')
        .mockImplementation((entity: any, data: any) => ({
          id: 1,
          ...data,
          password: hashedPassword,
          casts: [],
        }));
      jest.spyOn(queryRunner.manager, 'save').mockRejectedValue(error);

      await expect(provider.createMany(createManyUsersDto)).rejects.toThrow(
        ConflictException,
      );
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
