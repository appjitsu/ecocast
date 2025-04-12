import { BadRequestException, RequestTimeoutException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CastCategory, CastStatus, CastVoice, Paginated } from '@repo/types';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationProvider } from '../../common/pagination/providers/pagination.provider';
import { WebhookService } from '../../common/webhooks/webhook.service';
import { UsersService } from '../../users/providers/users.service';
import { Cast } from '../cast.entity';
import { CreateCastDTO } from '../dtos/create-cast.dto';
import { GetCastsDto } from '../dtos/get-casts.dto';
import { PatchCastDTO } from '../dtos/patch-cast.dto';
import { CastsService } from './casts.service';
import { CreateCastProvider } from './create-cast.provider';

describe('CastsService', () => {
  let service: CastsService;
  let castsRepository: Repository<Cast>;
  let paginationProvider: PaginationProvider;
  let createCastProvider: CreateCastProvider;

  const mockUser = {
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
        CastsService,
        {
          provide: getRepositoryToken(Cast),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: PaginationProvider,
          useValue: {
            paginateQuery: jest.fn(),
          },
        },
        {
          provide: CreateCastProvider,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: WebhookService,
          useValue: {
            dispatchEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CastsService>(CastsService);
    castsRepository = module.get<Repository<Cast>>(getRepositoryToken(Cast));
    paginationProvider = module.get<PaginationProvider>(PaginationProvider);
    createCastProvider = module.get<CreateCastProvider>(CreateCastProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated casts', async () => {
      const userId = 'test-user-id';
      const getCastsDto: GetCastsDto = {
        limit: 10,
        page: 1,
        startDate: new Date(),
        endDate: new Date(),
      };

      const paginatedResponse: Paginated<Cast> = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 0,
          currentPage: 1,
          totalPages: 0,
        },
        links: {
          first: '/casts?page=1',
          previous: '/casts?page=1',
          current: '/casts?page=1',
          next: '/casts?page=1',
          last: '/casts?page=1',
        },
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([
            paginatedResponse.data,
            paginatedResponse.meta.totalItems,
          ]),
      } as unknown as SelectQueryBuilder<Cast>;

      // Mock the methods directly instead of using spyOn
      castsRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);
      paginationProvider.paginateQuery = jest
        .fn()
        .mockResolvedValue(paginatedResponse);

      const result = await service.findAll(userId, getCastsDto);

      expect(result).toEqual(paginatedResponse);
      expect(castsRepository.createQueryBuilder).toHaveBeenCalledWith('cast');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'cast.ownerId = :userId',
        { userId },
      );
      expect(paginationProvider.paginateQuery).toHaveBeenCalledWith(
        {
          limit: getCastsDto.limit,
          page: getCastsDto.page,
        },
        mockQueryBuilder,
      );
    });

    it('should throw RequestTimeoutException on database error', async () => {
      const userId = '1';
      const getCastsDto: GetCastsDto = {
        page: 1,
        limit: 10,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
      } as unknown as SelectQueryBuilder<Cast>;

      // Use direct assignment instead of spyOn
      castsRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);
      paginationProvider.paginateQuery = jest
        .fn()
        .mockRejectedValue(new Error());

      await expect(service.findAll(userId, getCastsDto)).rejects.toThrow(
        RequestTimeoutException,
      );
    });
  });

  describe('create', () => {
    it('should create a new cast', async () => {
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

      const createCastSpy = jest
        .spyOn(createCastProvider, 'create')
        .mockResolvedValue(mockCast);

      const result = await service.create(createCastDto, activeUser);

      expect(result).toEqual(mockCast);
      expect(createCastSpy).toHaveBeenCalledWith(createCastDto, activeUser);
    });
  });

  describe('update', () => {
    it('should update an existing cast', async () => {
      const castId = 1;
      const patchCastDto: PatchCastDTO = {
        title: 'Updated Cast',
        castCategory: CastCategory.TECH,
      };

      const updatedCast: Cast = {
        ...mockCast,
        title: patchCastDto.title || mockCast.title,
        castCategory: patchCastDto.castCategory || mockCast.castCategory,
      };

      castsRepository.findOneBy = jest.fn().mockResolvedValue(mockCast);

      castsRepository.save = jest.fn().mockResolvedValue(updatedCast);

      const result = await service.update(castId, patchCastDto);

      expect(result).toEqual(updatedCast);
      expect(castsRepository.findOneBy).toHaveBeenCalledWith({ id: castId });
      expect(castsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: patchCastDto.title,
          castCategory: patchCastDto.castCategory,
        }),
      );
    });

    it('should throw BadRequestException if cast not found', async () => {
      const castId = 999;
      const patchCastDto: PatchCastDTO = {
        title: 'Updated Cast',
      };

      // Use direct assignment instead of spyOn
      castsRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.update(castId, patchCastDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw RequestTimeoutException on database error during find', async () => {
      const castId = 1;
      const patchCastDto: PatchCastDTO = {
        title: 'Updated Cast',
      };

      // Use direct assignment instead of spyOn
      castsRepository.findOneBy = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(service.update(castId, patchCastDto)).rejects.toThrow(
        RequestTimeoutException,
      );
    });

    it('should throw RequestTimeoutException on database error during save', async () => {
      const castId = 1;
      const patchCastDto: PatchCastDTO = {
        title: 'Updated Cast',
      };

      castsRepository.findOneBy = jest.fn().mockResolvedValue(mockCast);
      castsRepository.save = jest.fn().mockRejectedValue(new Error());

      await expect(service.update(castId, patchCastDto)).rejects.toThrow(
        RequestTimeoutException,
      );
    });
  });
});
