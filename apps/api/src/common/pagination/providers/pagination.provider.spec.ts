import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { PaginationProvider } from './pagination.provider';

interface MockRequest extends Partial<Request> {
  headers: {
    host: string;
  };
}

interface MockEntity {
  id: number;
  name: string;
}

describe('PaginationProvider', () => {
  let provider: PaginationProvider;
  let mockRequest: MockRequest;
  let mockRepository: Partial<Repository<MockEntity>>;

  beforeEach(async () => {
    mockRequest = {
      protocol: 'http',
      headers: {
        host: 'localhost:3000',
      },
      url: '/api/casts',
    };

    mockRepository = {
      find: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaginationProvider,
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    provider = module.get<PaginationProvider>(PaginationProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('paginateQuery', () => {
    it('should return paginated results with correct structure', async () => {
      const paginationQuery: PaginationQueryDto = {
        page: 2,
        limit: 5,
      };

      const mockData: MockEntity[] = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];

      (mockRepository.find as jest.Mock).mockResolvedValue(mockData);
      (mockRepository.count as jest.Mock).mockResolvedValue(12);

      const result = await provider.paginateQuery(
        paginationQuery,
        mockRepository as Repository<MockEntity>,
      );

      expect(result).toBeDefined();
      expect(result.data).toEqual(mockData);
      expect(result.meta).toEqual({
        itemsPerPage: 5,
        totalItems: 12,
        currentPage: 2,
        totalPages: 3,
      });

      // Verify links
      expect(result.links.first).toBe(
        'http://localhost:3000/api/casts?page=1&limit=5',
      );
      expect(result.links.last).toBe(
        'http://localhost:3000/api/casts?page=3&limit=5',
      );
      expect(result.links.current).toBe(
        'http://localhost:3000/api/casts?page=2&limit=5',
      );
      expect(result.links.next).toBe(
        'http://localhost:3000/api/casts?page=3&limit=5',
      );
      expect(result.links.previous).toBe(
        'http://localhost:3000/api/casts?page=1&limit=5',
      );

      // Verify repository calls
      expect(mockRepository.find).toHaveBeenCalledWith({
        skip: 5, // (page - 1) * limit
        take: 5,
      });
      expect(mockRepository.count).toHaveBeenCalled();
    });

    it('should use default pagination values when not provided', async () => {
      const paginationQuery: PaginationQueryDto = {};

      const mockData: MockEntity[] = [{ id: 1, name: 'Item 1' }];
      (mockRepository.find as jest.Mock).mockResolvedValue(mockData);
      (mockRepository.count as jest.Mock).mockResolvedValue(1);

      const result = await provider.paginateQuery(
        paginationQuery,
        mockRepository as Repository<MockEntity>,
      );

      expect(result.meta.itemsPerPage).toBe(10); // Default limit
      expect(result.meta.currentPage).toBe(1); // Default page
      expect(mockRepository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should handle last page correctly', async () => {
      const paginationQuery: PaginationQueryDto = {
        page: 3,
        limit: 5,
      };

      const mockData: MockEntity[] = [{ id: 11, name: 'Item 11' }];
      (mockRepository.find as jest.Mock).mockResolvedValue(mockData);
      (mockRepository.count as jest.Mock).mockResolvedValue(11);

      const result = await provider.paginateQuery(
        paginationQuery,
        mockRepository as Repository<MockEntity>,
      );

      expect(result.meta.totalPages).toBe(3);
      expect(result.links.next).toBe(
        'http://localhost:3000/api/casts?page=3&limit=5',
      ); // Next should be same as current on last page
      expect(result.links.previous).toBe(
        'http://localhost:3000/api/casts?page=2&limit=5',
      );
    });

    it('should handle first page correctly', async () => {
      const paginationQuery: PaginationQueryDto = {
        page: 1,
        limit: 5,
      };

      const mockData: MockEntity[] = [{ id: 1, name: 'Item 1' }];
      (mockRepository.find as jest.Mock).mockResolvedValue(mockData);
      (mockRepository.count as jest.Mock).mockResolvedValue(11);

      const result = await provider.paginateQuery(
        paginationQuery,
        mockRepository as Repository<MockEntity>,
      );

      expect(result.meta.totalPages).toBe(3);
      expect(result.links.previous).toBe(
        'http://localhost:3000/api/casts?page=1&limit=5',
      ); // Previous should be same as current on first page
      expect(result.links.next).toBe(
        'http://localhost:3000/api/casts?page=2&limit=5',
      );
    });
  });
});
