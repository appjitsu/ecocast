import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { FindOneByGoogleIdProvider } from './find-one-by-google-id.provider';

describe('FindOneByGoogleIdProvider', () => {
  let provider: FindOneByGoogleIdProvider;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneByGoogleIdProvider,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(function (this: void) {
              return Promise.resolve(null);
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<FindOneByGoogleIdProvider>(FindOneByGoogleIdProvider);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('findOneByGoogleId', () => {
    const googleId = 'google123';
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      googleId,
      firstName: 'Test',
      lastName: 'User',
    };

    it('should find a user by Google ID successfully', async () => {
      const findOneByMock = jest.fn().mockResolvedValue(mockUser as User);
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockImplementation(findOneByMock);

      const result = await provider.findOneByGoogleId(googleId);

      expect(findOneByMock).toHaveBeenCalledWith({ googleId });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const findOneByMock = jest.fn().mockResolvedValue(null);
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockImplementation(findOneByMock);

      const result = await provider.findOneByGoogleId(googleId);

      expect(findOneByMock).toHaveBeenCalledWith({ googleId });
      expect(result).toBeNull();
    });

    it('should handle database error gracefully', async () => {
      const findOneByMock = jest.fn().mockRejectedValue(new Error());
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockImplementation(findOneByMock);

      try {
        await provider.findOneByGoogleId(googleId);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      expect(findOneByMock).toHaveBeenCalledWith({ googleId });
    });
  });
});
