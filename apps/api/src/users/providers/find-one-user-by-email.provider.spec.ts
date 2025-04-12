import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { User } from '../user.entity';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';

describe('FindOneUserByEmailProvider', () => {
  let provider: FindOneUserByEmailProvider;
  let mockQueryBuilder: SelectQueryBuilder<User>;

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn<Promise<User | null>, []>().mockResolvedValue(null),
      getSql: jest
        .fn()
        .mockReturnValue('SELECT * FROM "user" WHERE "email" = $1'),
    } as unknown as SelectQueryBuilder<User>;

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
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('findOneByEmail', () => {
    const email = 'test@example.com';
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'hashedPassword',
      casts: [],
    };

    it('should return a user when found', async () => {
      const whereMock = jest.fn().mockReturnThis();
      mockQueryBuilder.where = whereMock;
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await provider.findOneByEmail(email);

      expect(whereMock).toHaveBeenCalledWith('user.email = :email', { email });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const whereMock = jest.fn().mockReturnThis();
      mockQueryBuilder.where = whereMock;
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);

      await expect(provider.findOneByEmail(email)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(whereMock).toHaveBeenCalledWith('user.email = :email', { email });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      (mockQueryBuilder.getOne as jest.Mock).mockRejectedValue(new Error());

      await expect(provider.findOneByEmail(email)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
