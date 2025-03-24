import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Paginated } from '@repo/types';
import { Request } from 'express';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';

@Injectable()
export class PaginationProvider {
  constructor(
    /**
     * Injecting request
     */
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}
  public async paginateQuery<T extends ObjectLiteral>(
    { page = 1, limit = 10 }: PaginationQueryDto,
    queryBuilderOrRepo: SelectQueryBuilder<T> | Repository<T>,
  ): Promise<Paginated<T>> {
    let results: T[];
    let totalItems: number;

    // Check if we're working with a Repository or a SelectQueryBuilder
    if ('find' in queryBuilderOrRepo) {
      // It's a Repository
      results = await queryBuilderOrRepo.find({
        skip: (page - 1) * limit,
        take: limit,
      });
      totalItems = await queryBuilderOrRepo.count();
    } else {
      // It's a SelectQueryBuilder
      results = await queryBuilderOrRepo
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
      totalItems = await queryBuilderOrRepo.getCount();
    }

    // request urls
    const baseUrl =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseUrl);

    // calculating page numbers
    const totalPages = Math.ceil(totalItems / limit);
    const nextPage = page === totalPages ? page : page + 1;
    const prevPage = page === 1 ? page : page - 1;

    const response: Paginated<T> = {
      data: results,
      meta: {
        itemsPerPage: limit,
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page,
      },
      links: {
        first: `${newUrl.origin}${newUrl.pathname}?page=1&limit=${limit}`,
        last: `${newUrl.origin}${newUrl.pathname}?page=${totalPages}&limit=${limit}`,
        current: `${newUrl.origin}${newUrl.pathname}?page=${page}&limit=${limit}`,
        next: `${newUrl.origin}${newUrl.pathname}?page=${nextPage}&limit=${limit}`,
        previous: `${newUrl.origin}${newUrl.pathname}?page=${prevPage}&limit=${limit}`,
      },
    };

    return response;
  }
}
