import { BadRequestException, RequestTimeoutException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Paginated } from '@repo/types';
import { Repository } from 'typeorm';
import { PaginationProvider } from '../../common/pagination/providers/pagination.provider';
import { UsersService } from '../../users/providers/users.service';
import { Cast } from '../cast.entity';
import { CreateCastDTO } from '../dtos/create-cast.dto';
import { GetCastsDto } from '../dtos/get-casts.dto';
import { PatchCastDTO } from '../dtos/patch-cast.dto';
import { castCategory } from '../enums/castCategory.enum';
import { castStatus } from '../enums/castStatus.enum';
import { castVoice } from '../enums/castVoice.enum';
import { CastsService } from './casts.service';
import { CreateCastProvider } from './create-cast.provider';

describe('CastsService', () => {
  let service: CastsService;
  let castsRepository: Repository<Cast>;
  let usersService: UsersService;
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
        CastsService,
        {
          provide: getRepositoryToken(Cast),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneById: jest.fn(),
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
      ],
    }).compile();

    service = module.get<CastsService>(CastsService);
    castsRepository = module.get<Repository<Cast>>(getRepositoryToken(Cast));
    usersService = module.get<UsersService>(UsersService);
    paginationProvider = module.get<PaginationProvider>(PaginationProvider);
    createCastProvider = module.get<CreateCastProvider>(CreateCastProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated casts', async () => {
      const userId = '1';
      const getCastsDto: GetCastsDto = {
        page: 1,
        limit: 10,
        startDate: new Date(),
        endDate: new Date(),
      };

      const paginatedResponse: Paginated<Cast> = {
        data: [mockCast],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          first: '/casts?page=1',
          previous: '/casts?page=1',
          current: '/casts?page=1',
          next: '/casts?page=1',
          last: '/casts?page=1',
        },
      };

      jest
        .spyOn(paginationProvider, 'paginateQuery')
        .mockResolvedValue(paginatedResponse);

      const result = await service.findAll(userId, getCastsDto);

      expect(result).toEqual(paginatedResponse);
      expect(paginationProvider.paginateQuery).toHaveBeenCalledWith(
        {
          limit: getCastsDto.limit,
          page: getCastsDto.page,
        },
        castsRepository,
      );
    });

    it('should throw RequestTimeoutException on database error', async () => {
      const userId = '1';
      const getCastsDto: GetCastsDto = {
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(paginationProvider, 'paginateQuery')
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

      jest.spyOn(createCastProvider, 'create').mockResolvedValue(mockCast);

      const result = await service.create(createCastDto, activeUser);

      expect(result).toEqual(mockCast);
      expect(createCastProvider.create).toHaveBeenCalledWith(
        createCastDto,
        activeUser,
      );
    });
  });

  describe('update', () => {
    it('should update an existing cast', async () => {
      const castId = 1;
      const patchCastDto: PatchCastDTO = {
        title: 'Updated Cast',
        castCategory: castCategory.TECHNOLOGY,
      };

      const updatedCast: Cast = {
        ...mockCast,
        title: patchCastDto.title!,
        castCategory: patchCastDto.castCategory!,
      };

      jest.spyOn(castsRepository, 'findOneBy').mockResolvedValue(mockCast);
      jest.spyOn(castsRepository, 'save').mockResolvedValue(updatedCast);

      const result = await service.update(castId, patchCastDto);

      expect(result).toEqual(updatedCast);
      expect(castsRepository.findOneBy).toHaveBeenCalledWith({ id: castId });
      expect(castsRepository.save).toHaveBeenCalledWith({
        ...mockCast,
        ...patchCastDto,
      });
    });

    it('should throw BadRequestException if cast not found', async () => {
      const castId = 999;
      const patchCastDto: PatchCastDTO = {
        title: 'Updated Cast',
      };

      jest.spyOn(castsRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.update(castId, patchCastDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw RequestTimeoutException on database error during find', async () => {
      const castId = 1;
      const patchCastDto: PatchCastDTO = {
        title: 'Updated Cast',
      };

      jest.spyOn(castsRepository, 'findOneBy').mockRejectedValue(new Error());

      await expect(service.update(castId, patchCastDto)).rejects.toThrow(
        RequestTimeoutException,
      );
    });

    it('should throw RequestTimeoutException on database error during save', async () => {
      const castId = 1;
      const patchCastDto: PatchCastDTO = {
        title: 'Updated Cast',
      };

      jest.spyOn(castsRepository, 'findOneBy').mockResolvedValue(mockCast);
      jest.spyOn(castsRepository, 'save').mockRejectedValue(new Error());

      await expect(service.update(castId, patchCastDto)).rejects.toThrow(
        RequestTimeoutException,
      );
    });
  });
});
