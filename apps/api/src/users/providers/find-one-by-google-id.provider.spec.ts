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
            findOneBy: jest.fn(),
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
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValue(mockUser as User);

      const result = await provider.findOneByGoogleId(googleId);

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ googleId });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);

      const result = await provider.findOneByGoogleId(googleId);

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ googleId });
      expect(result).toBeNull();
    });

    it('should handle database error gracefully', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockRejectedValue(new Error());

      try {
        await provider.findOneByGoogleId(googleId);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ googleId });
    });
  });
});
