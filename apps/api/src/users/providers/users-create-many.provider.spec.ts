import { ConflictException, RequestTimeoutException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { HashingProvider } from '../../auth/providers/hashing.provider';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';
import { User } from '../user.entity';
import { UsersCreateManyProvider } from './users-create-many.provider';

interface MockQueryRunner extends Omit<QueryRunner, 'manager'> {
  manager: {
    create: jest.Mock<User, [typeof User, Partial<User>]> &
      Partial<EntityManager>;
    save: jest.Mock<Promise<User[]>, [User[]]> & Partial<EntityManager>;
  } & Partial<EntityManager>;
}

describe('UsersCreateManyProvider', () => {
  let provider: UsersCreateManyProvider;
  let hashingProvider: HashingProvider;
  let queryRunner: MockQueryRunner;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn<Promise<void>, []>().mockResolvedValue(),
      startTransaction: jest.fn<Promise<void>, []>().mockResolvedValue(),
      commitTransaction: jest.fn<Promise<void>, []>().mockResolvedValue(),
      rollbackTransaction: jest.fn<Promise<void>, []>().mockResolvedValue(),
      release: jest.fn<Promise<void>, []>().mockResolvedValue(),
      isTransactionActive: true,
      manager: {
        create: jest.fn<User, [typeof User, Partial<User>]>(),
        save: jest.fn<Promise<User[]>, [User[]]>(),
      },
    } as unknown as MockQueryRunner;

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
            hashPassword: jest.fn<Promise<string>, [string]>(),
          },
        },
      ],
    }).compile();

    provider = module.get<UsersCreateManyProvider>(UsersCreateManyProvider);
    hashingProvider = module.get<HashingProvider>(HashingProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('createMany', () => {
    const createManyUsersDto: CreateManyUsersDto = {
      users: [
        {
          email: 'test1@example.com',
          firstName: 'Test1',
          lastName: 'User1',
          password: 'password1',
        },
        {
          email: 'test2@example.com',
          firstName: 'Test2',
          lastName: 'User2',
          password: 'password2',
        },
      ],
    };

    it('should create multiple users successfully', async () => {
      const hashedPasswords = ['hashed1', 'hashed2'];
      const createdUsers = createManyUsersDto.users.map((user, index) => ({
        ...user,
        id: index + 1,
        password: hashedPasswords[index],
        casts: [],
      })) as User[];

      const hashPasswordMock = jest.fn<Promise<string>, [string]>();
      hashPasswordMock
        .mockResolvedValueOnce(hashedPasswords[0])
        .mockResolvedValueOnce(hashedPasswords[1]);
      hashingProvider.hashPassword = hashPasswordMock;

      (queryRunner.manager.create as jest.Mock)
        .mockReturnValueOnce(createdUsers[0])
        .mockReturnValueOnce(createdUsers[1]);

      (queryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(createdUsers[0])
        .mockResolvedValueOnce(createdUsers[1]);

      const result = await provider.createMany(createManyUsersDto);

      expect(result).toEqual([createdUsers[0], createdUsers[1]]);
      expect(hashingProvider.hashPassword).toHaveBeenCalledTimes(2);

      const createMock = queryRunner.manager.create as jest.Mock<
        User,
        [typeof User, Partial<User>]
      >;
      expect(createMock).toHaveBeenCalledTimes(2);
    });

    it('should throw RequestTimeoutException on database connection error', async () => {
      const connectMock = jest
        .fn<Promise<void>, []>()
        .mockRejectedValue(new Error('Connection failed'));
      queryRunner.connect = connectMock;

      await expect(provider.createMany(createManyUsersDto)).rejects.toThrow(
        RequestTimeoutException,
      );
      expect(connectMock).toHaveBeenCalled();
      const releaseMock = queryRunner.release as jest.Mock<Promise<void>, []>;
      expect(releaseMock).toHaveBeenCalled();
    });

    it('should throw ConflictException and rollback on save error', async () => {
      const error = new Error('Duplicate entry');
      const hashedPasswords = ['hashed1', 'hashed2'];

      const startTransactionMock = jest
        .fn<Promise<void>, []>()
        .mockResolvedValue();
      const rollbackTransactionMock = jest
        .fn<Promise<void>, []>()
        .mockResolvedValue();
      const releaseMock = jest.fn<Promise<void>, []>().mockResolvedValue();

      // Assign mocks to queryRunner
      queryRunner.startTransaction = startTransactionMock;
      queryRunner.rollbackTransaction = rollbackTransactionMock;
      queryRunner.release = releaseMock;

      // Instead of directly setting isTransactionActive, we'll mock the method
      // that checks it during error handling
      Object.defineProperty(queryRunner, 'isTransactionActive', {
        get: jest.fn().mockReturnValue(true),
      });

      const hashPasswordMock = jest.fn<Promise<string>, [string]>();
      hashPasswordMock
        .mockResolvedValueOnce(hashedPasswords[0])
        .mockResolvedValueOnce(hashedPasswords[1]);
      hashingProvider.hashPassword = hashPasswordMock;

      const createMock = jest.fn<User, [typeof User, Partial<User>]>();
      createMock.mockReturnValueOnce({
        id: 1,
        email: createManyUsersDto.users[0].email,
        password: hashedPasswords[0],
        firstName: createManyUsersDto.users[0].firstName || '',
        lastName: createManyUsersDto.users[0].lastName || '',
        casts: [],
      });
      queryRunner.manager.create =
        createMock as unknown as typeof queryRunner.manager.create;

      const saveMock = jest.fn<Promise<User[]>, [User[]]>();
      saveMock.mockImplementation(() => {
        throw error;
      });
      queryRunner.manager.save =
        saveMock as unknown as typeof queryRunner.manager.save;

      await expect(provider.createMany(createManyUsersDto)).rejects.toThrow(
        ConflictException,
      );

      expect(startTransactionMock).toHaveBeenCalled();
      expect(rollbackTransactionMock).toHaveBeenCalled();
      expect(releaseMock).toHaveBeenCalled();
    });
  });
});
