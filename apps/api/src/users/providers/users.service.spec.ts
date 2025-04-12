import { BadRequestException, RequestTimeoutException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GoogleUser } from '@repo/types';
import { Repository } from 'typeorm';
import profileConfig from '../config/profile.config';
import { User } from '../user.entity';
import { CreateGoogleUserProvider } from './create-google-user.provider';
import { CreateUserProvider } from './create-user.provider';
import { FindOneByGoogleIdProvider } from './find-one-by-google-id.provider';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';
import { UsersCreateManyProvider } from './users-create-many.provider';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let createUserProvider: CreateUserProvider;
  let findOneUserByEmailProvider: FindOneUserByEmailProvider;
  let findOneByGoogleIdProvider: FindOneByGoogleIdProvider;
  let createGoogleUserProvider: CreateGoogleUserProvider;
  let usersCreateManyProvider: UsersCreateManyProvider;

  const mockProfileConfig: ConfigType<typeof profileConfig> = {
    apiKey: 'test-api-key',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: CreateUserProvider,
          useValue: {
            createUser: jest.fn(),
          },
        },
        {
          provide: FindOneUserByEmailProvider,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: FindOneByGoogleIdProvider,
          useValue: {
            findOneByGoogleId: jest.fn(),
          },
        },
        {
          provide: CreateGoogleUserProvider,
          useValue: {
            createGoogleUser: jest.fn(),
          },
        },
        {
          provide: UsersCreateManyProvider,
          useValue: {
            createMany: jest.fn(),
          },
        },
        {
          provide: profileConfig.KEY,
          useValue: mockProfileConfig,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    createUserProvider = module.get<CreateUserProvider>(CreateUserProvider);
    findOneUserByEmailProvider = module.get<FindOneUserByEmailProvider>(
      FindOneUserByEmailProvider,
    );
    findOneByGoogleIdProvider = module.get<FindOneByGoogleIdProvider>(
      FindOneByGoogleIdProvider,
    );
    createGoogleUserProvider = module.get<CreateGoogleUserProvider>(
      CreateGoogleUserProvider,
    );
    usersCreateManyProvider = module.get<UsersCreateManyProvider>(
      UsersCreateManyProvider,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should create a user successfully', async () => {
      const expectedUser = { id: 1, ...createUserDto };
      jest
        .spyOn(createUserProvider, 'createUser')
        .mockImplementation(() => Promise.resolve(expectedUser as User));

      const result = await service.createUser(createUserDto);

      expect(createUserProvider.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });

    it('should throw RequestTimeoutException on database error', async () => {
      jest
        .spyOn(createUserProvider, 'createUser')
        .mockImplementation(() =>
          Promise.reject(new RequestTimeoutException()),
        );

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        RequestTimeoutException,
      );

      expect(createUserProvider.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findOneById', () => {
    const userId = 1;
    const mockUser = { id: userId, email: 'test@example.com' };

    it('should return a user when found', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(mockUser as User));

      const result = await service.findOneById(userId);

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        id: userId,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException when user not found', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(null));

      await expect(service.findOneById(userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw RequestTimeoutException on database error', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockImplementation(() => Promise.reject(new Error()));

      await expect(service.findOneById(userId)).rejects.toThrow(
        RequestTimeoutException,
      );
    });
  });

  describe('createMany', () => {
    const createManyDto = {
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
      const expectedUsers = createManyDto.users.map((user, index) => ({
        id: index + 1,
        ...user,
      }));
      jest
        .spyOn(usersCreateManyProvider, 'createMany')
        .mockImplementation(() => Promise.resolve(expectedUsers as User[]));

      const result = await service.createMany(createManyDto);

      expect(usersCreateManyProvider.createMany).toHaveBeenCalledWith(
        createManyDto,
      );
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOneByEmail', () => {
    const email = 'test@example.com';
    const mockUser = { id: 1, email };

    it('should find a user by email', async () => {
      jest
        .spyOn(findOneUserByEmailProvider, 'findOneByEmail')
        .mockImplementation(() => Promise.resolve(mockUser as User));

      const result = await service.findOneByEmail(email);

      expect(findOneUserByEmailProvider.findOneByEmail).toHaveBeenCalledWith(
        email,
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneByGoogleId', () => {
    const googleId = 'google123';
    const mockUser = { id: 1, googleId };

    it('should find a user by Google ID', async () => {
      jest
        .spyOn(findOneByGoogleIdProvider, 'findOneByGoogleId')
        .mockImplementation(() => Promise.resolve(mockUser as User));

      const result = await service.findOneByGoogleId(googleId);

      expect(findOneByGoogleIdProvider.findOneByGoogleId).toHaveBeenCalledWith(
        googleId,
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('createGoogleUser', () => {
    const googleUser: GoogleUser = {
      email: 'test@gmail.com',
      googleId: 'google123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should create a Google user successfully', async () => {
      const expectedUser = { id: 1, ...googleUser };
      jest
        .spyOn(createGoogleUserProvider, 'createGoogleUser')
        .mockImplementation(() => Promise.resolve(expectedUser as User));

      const result = await service.createGoogleUser(googleUser);

      expect(createGoogleUserProvider.createGoogleUser).toHaveBeenCalledWith(
        googleUser,
      );
      expect(result).toEqual(expectedUser);
    });
  });
});
