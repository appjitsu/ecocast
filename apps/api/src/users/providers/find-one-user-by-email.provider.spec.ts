import { RequestTimeoutException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';

describe('FindOneUserByEmailProvider', () => {
  let provider: FindOneUserByEmailProvider;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneUserByEmailProvider,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
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
      jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValue(mockUser as User);

      const result = await provider.findOneByEmail(email);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      await expect(provider.findOneByEmail(email)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should throw RequestTimeoutException on database error', async () => {
      jest.spyOn(usersRepository, 'findOne').mockRejectedValue(new Error());

      await expect(provider.findOneByEmail(email)).rejects.toThrow(
        RequestTimeoutException,
      );
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });
});
