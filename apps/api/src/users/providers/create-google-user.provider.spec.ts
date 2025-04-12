import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GoogleUser } from '@repo/types';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { CreateGoogleUserProvider } from './create-google-user.provider';

describe('CreateGoogleUserProvider', () => {
  let provider: CreateGoogleUserProvider;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGoogleUserProvider,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<CreateGoogleUserProvider>(CreateGoogleUserProvider);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
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
        .spyOn(usersRepository, 'create')
        .mockImplementation(() => expectedUser as User);
      jest
        .spyOn(usersRepository, 'save')
        .mockImplementation(() => Promise.resolve(expectedUser as User));

      const result = await provider.createGoogleUser(googleUser);

      expect(usersRepository.create).toHaveBeenCalledWith(googleUser);

      expect(usersRepository.save).toHaveBeenCalledWith(expectedUser);
      expect(result).toEqual(expectedUser);
    });

    it('should throw ConflictException if user with email already exists', async () => {
      const error = new Error('Duplicate entry');
      jest
        .spyOn(usersRepository, 'create')
        .mockImplementation(() => googleUser as User);
      jest
        .spyOn(usersRepository, 'save')
        .mockImplementation(() => Promise.reject(error));

      await expect(provider.createGoogleUser(googleUser)).rejects.toThrow(
        ConflictException,
      );

      expect(usersRepository.create).toHaveBeenCalledWith(googleUser);

      expect(usersRepository.save).toHaveBeenCalledWith(googleUser);
    });
  });
});
