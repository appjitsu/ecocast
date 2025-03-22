import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/providers/users.service';
import { User } from '../../users/user.entity';
import { Cast } from '../cast.entity';
import { CreateCastDTO } from '../dtos/create-cast.dto';
import { castCategory } from '../enums/castCategory.enum';
import { castStatus } from '../enums/castStatus.enum';
import { castVoice } from '../enums/castVoice.enum';
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
    castCategory: castCategory.NEWS,
    slug: 'test-cast',
    status: castStatus.DRAFT,
    content: 'Test content',
    voice: castVoice.JOHN,
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
      castCategory: castCategory.NEWS,
      slug: 'test-cast',
      status: castStatus.DRAFT,
      content: 'Test content',
      voice: castVoice.JOHN,
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
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(mockUser);
      jest.spyOn(castsRepository, 'create').mockReturnValue(mockCast);
      jest.spyOn(castsRepository, 'save').mockResolvedValue(mockCast);

      const result = await provider.create(createCastDto, activeUser);

      expect(result).toEqual(mockCast);
      expect(usersService.findOneById).toHaveBeenCalledWith(activeUser.sub);
      expect(castsRepository.create).toHaveBeenCalledWith({
        ...createCastDto,
        owner: mockUser,
      });
      expect(castsRepository.save).toHaveBeenCalledWith(mockCast);
    });

    it('should throw ConflictException if user is not found', async () => {
      jest.spyOn(usersService, 'findOneById').mockRejectedValue(new Error());

      await expect(provider.create(createCastDto, activeUser)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.findOneById).toHaveBeenCalledWith(activeUser.sub);
    });

    it('should throw ConflictException on database error during save', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(mockUser);
      jest.spyOn(castsRepository, 'create').mockReturnValue(mockCast);
      jest.spyOn(castsRepository, 'save').mockRejectedValue(new Error());

      await expect(provider.create(createCastDto, activeUser)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.findOneById).toHaveBeenCalledWith(activeUser.sub);
      expect(castsRepository.create).toHaveBeenCalledWith({
        ...createCastDto,
        owner: mockUser,
      });
      expect(castsRepository.save).toHaveBeenCalledWith(mockCast);
    });
  });
});
