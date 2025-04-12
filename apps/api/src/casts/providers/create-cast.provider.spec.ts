import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CastCategory, CastStatus, CastVoice } from '@repo/types';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/providers/users.service';
import { User } from '../../users/user.entity';
import { Cast } from '../cast.entity';
import { CreateCastDTO } from '../dtos/create-cast.dto';
import { CreateCastProvider } from './create-cast.provider';

describe('CreateCastProvider', () => {
  let provider: CreateCastProvider;
  let castsRepository: Repository<Cast>;
  let usersService: UsersService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashedPassword',
    casts: [],
  };

  const mockCast: Cast = {
    id: 1,
    title: 'Test Cast',
    castCategory: CastCategory.NEWS,
    slug: 'test-cast',
    status: CastStatus.DRAFT,
    content: 'Test content',
    voice: CastVoice.JOHN,
    voiceOverUrl: 'https://example.com/voice.mp3',
    featuredImageUrl: 'https://example.com/image.jpg',
    scheduledFor: new Date(),
    publishedOn: new Date(),
    owner: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCastProvider,
        {
          provide: getRepositoryToken(Cast),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<CreateCastProvider>(CreateCastProvider);
    castsRepository = module.get<Repository<Cast>>(getRepositoryToken(Cast));
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('create', () => {
    const createCastDto: CreateCastDTO = {
      title: 'Test Cast',
      castCategory: CastCategory.NEWS,
      slug: 'test-cast',
      status: CastStatus.DRAFT,
      content: 'Test content',
      voice: CastVoice.JOHN,
      voiceOverUrl: 'https://example.com/voice.mp3',
      featuredImageUrl: 'https://example.com/image.jpg',
      scheduledFor: new Date(),
      publishedOn: new Date(),
    };

    const activeUser = {
      sub: 1,
      email: 'test@example.com',
    };

    it('should create a new cast successfully', async () => {
      const findOneByIdSpy = jest
        .spyOn(usersService, 'findOneById')
        .mockImplementation(function (this: void) {
          return Promise.resolve(mockUser);
        });
      const createSpy = jest
        .spyOn(castsRepository, 'create')
        .mockImplementation(function (this: void) {
          return mockCast;
        });
      const saveSpy = jest
        .spyOn(castsRepository, 'save')
        .mockImplementation(function (this: void) {
          return Promise.resolve(mockCast);
        });

      const result = await provider.create(createCastDto, activeUser);

      expect(result).toEqual(mockCast);
      expect(findOneByIdSpy).toHaveBeenCalledWith(activeUser.sub);
      expect(createSpy).toHaveBeenCalledWith({
        ...createCastDto,
        owner: mockUser,
      });
      expect(saveSpy).toHaveBeenCalledWith(mockCast);
    });

    it('should throw ConflictException if user is not found', async () => {
      const findOneByIdSpy = jest
        .spyOn(usersService, 'findOneById')
        .mockImplementation(function (this: void) {
          return Promise.reject(new Error());
        });

      await expect(provider.create(createCastDto, activeUser)).rejects.toThrow(
        ConflictException,
      );
      expect(findOneByIdSpy).toHaveBeenCalledWith(activeUser.sub);
    });

    it('should throw ConflictException on database error during save', async () => {
      const findOneByIdSpy = jest
        .spyOn(usersService, 'findOneById')
        .mockImplementation(function (this: void) {
          return Promise.resolve(mockUser);
        });
      const createSpy = jest
        .spyOn(castsRepository, 'create')
        .mockImplementation(function (this: void) {
          return mockCast;
        });
      const saveSpy = jest
        .spyOn(castsRepository, 'save')
        .mockImplementation(function (this: void) {
          return Promise.reject(new Error());
        });

      await expect(provider.create(createCastDto, activeUser)).rejects.toThrow(
        ConflictException,
      );
      expect(findOneByIdSpy).toHaveBeenCalledWith(activeUser.sub);
      expect(createSpy).toHaveBeenCalledWith({
        ...createCastDto,
        owner: mockUser,
      });
      expect(saveSpy).toHaveBeenCalledWith(mockCast);
    });
  });
});
