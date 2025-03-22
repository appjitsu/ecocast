import { BadRequestException, RequestTimeoutException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { CreateUserProvider } from './create-user.provider';

describe('CreateUserProvider', () => {
  let provider: CreateUserProvider;
  let usersRepository: Repository<User>;
  let hashingProvider: HashingProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserProvider,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
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

    provider = module.get<CreateUserProvider>(CreateUserProvider);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hashingProvider = module.get<HashingProvider>(HashingProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should create a user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const expectedUser = {
        id: 1,
        ...createUserDto,
        password: hashedPassword,
      };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(hashingProvider, 'hashPassword')
        .mockResolvedValue(hashedPassword);
      jest
        .spyOn(usersRepository, 'create')
        .mockReturnValue(expectedUser as User);
      jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValue(expectedUser as User);

      const result = await provider.createUser(createUserDto);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(hashingProvider.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(usersRepository.save).toHaveBeenCalledWith(expectedUser);
      expect(result).toEqual(expectedUser);
    });

    it('should throw BadRequestException if user already exists', async () => {
      const existingUser = { id: 1, ...createUserDto };
      jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValue(existingUser as User);

      await expect(provider.createUser(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });

    it('should throw RequestTimeoutException on database error during find', async () => {
      jest.spyOn(usersRepository, 'findOne').mockRejectedValue(new Error());

      await expect(provider.createUser(createUserDto)).rejects.toThrow(
        RequestTimeoutException,
      );
    });

    it('should throw RequestTimeoutException on database error during save', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(hashingProvider, 'hashPassword')
        .mockResolvedValue('hashedPassword');
      jest
        .spyOn(usersRepository, 'create')
        .mockReturnValue({ ...createUserDto } as User);
      jest.spyOn(usersRepository, 'save').mockRejectedValue(new Error());

      await expect(provider.createUser(createUserDto)).rejects.toThrow(
        RequestTimeoutException,
      );
    });
  });
});
