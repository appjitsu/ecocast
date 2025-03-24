import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';

describe('FindOneUserByEmailProvider', () => {
  let provider: FindOneUserByEmailProvider;
  let usersRepository: Repository<User>;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getSql: jest
        .fn()
        .mockReturnValue('SELECT * FROM "user" WHERE "email" = $1'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneUserByEmailProvider,
        {
          provide: getRepositoryToken(User),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    provider = module.get<FindOneUserByEmailProvider>(
      FindOneUserByEmailProvider,
    );
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('findOneByEmail', () => {
    const email = 'test@example.com';
    const mockUser = {
      id: 1,
      email,
      firstName: 'Test',
      lastName: 'User',
    };

    it('should find a user by email successfully', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      const result = await provider.findOneByEmail(email);

      expect(usersRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.email = :email',
        { email },
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(provider.findOneByEmail(email)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.email = :email',
        { email },
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockQueryBuilder.getOne.mockRejectedValue(new Error('Database error'));

      await expect(provider.findOneByEmail(email)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(usersRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.email = :email',
        { email },
      );
    });
  });
});
