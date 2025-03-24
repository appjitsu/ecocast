import { Test, TestingModule } from '@nestjs/testing';
import { CastCategory, CastStatus, CastVoice, Paginated } from '@repo/types';
import { User } from '../users/user.entity';
import { Cast } from './cast.entity';
import { CastsController } from './casts.controller';
import { CreateCastDTO } from './dtos/create-cast.dto';
import { GetCastsDto } from './dtos/get-casts.dto';
import { PatchCastDTO } from './dtos/patch-cast.dto';
import { CastsService } from './providers/casts.service';

describe('CastsController', () => {
  let controller: CastsController;
  let castsService: CastsService;

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
      controllers: [CastsController],
      providers: [
        {
          provide: CastsService,
          useValue: {
            findAll: jest.fn(),
            create: jest
              .fn()
              .mockImplementation((dto, user) => Promise.resolve(mockCast)),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CastsController>(CastsController);
    castsService = module.get<CastsService>(CastsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCasts', () => {
    it('should get all casts for a user with pagination', async () => {
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

      jest.spyOn(castsService, 'findAll').mockResolvedValue(paginatedResponse);

      const result = await controller.getCasts(userId, getCastsDto);

      expect(result).toEqual(paginatedResponse);
      expect(castsService.findAll).toHaveBeenCalledWith(userId, getCastsDto);
    });
  });

  describe('createCast', () => {
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

      jest.spyOn(castsService, 'create').mockResolvedValue(mockCast);

      const result = await controller.createCast(createCastDto, activeUser);

      expect(result).toEqual(mockCast);
      expect(castsService.create).toHaveBeenCalledWith(
        createCastDto,
        activeUser,
      );
    });
  });

  describe('updateCast', () => {
    it('should update an existing cast', async () => {
      const castId = 1;
      const patchCastDto: PatchCastDTO = {
        title: 'Updated Cast',
        castCategory: CastCategory.TECH,
      };

      const updatedCast: Cast = {
        ...mockCast,
        title: patchCastDto.title!,
        castCategory: patchCastDto.castCategory!,
      };

      jest.spyOn(castsService, 'update').mockResolvedValue(updatedCast);

      const result = await controller.updateCast(castId, patchCastDto);

      expect(result).toEqual(updatedCast);
      expect(castsService.update).toHaveBeenCalledWith(castId, patchCastDto);
    });
  });
});
