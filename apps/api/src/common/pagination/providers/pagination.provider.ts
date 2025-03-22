import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ObjectLiteral, Repository } from 'typeorm';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { Paginated } from '../interfaces/paginated.interface';

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
    paginationQuery: PaginationQueryDto,
    repository: Repository<T>,
  ): Promise<Paginated<T>> {
    const results = await repository.find({
      skip: (paginationQuery.page - 1) * paginationQuery.limit,
      take: paginationQuery.limit,
    });

    // request urls
    const baseUrl =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseUrl);

    // calculating page numbers
    const totalItems = await repository.count();
    const totalPages = Math.ceil(totalItems / paginationQuery.limit);
    const nextPage =
      paginationQuery.page === totalPages
        ? paginationQuery.page
        : paginationQuery.page + 1;
    const prevPage =
      paginationQuery.page === 1
        ? paginationQuery.page
        : paginationQuery.page - 1;

    const response: Paginated<T> = {
      data: results,
      meta: {
        itemsPerPage: paginationQuery.limit,
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: paginationQuery.page,
      },
      links: {
        first: `${newUrl.origin}${newUrl.pathname}?page=1&limit=${paginationQuery.limit}`,
        last: `${newUrl.origin}${newUrl.pathname}?page=${totalPages}&limit=${paginationQuery.limit}`,
        current: `${newUrl.origin}${newUrl.pathname}?page=${paginationQuery.page}&limit=${paginationQuery.limit}`,
        next: `${newUrl.origin}${newUrl.pathname}?page=${nextPage}&limit=${paginationQuery.limit}`,
        previous: `${newUrl.origin}${newUrl.pathname}?page=${prevPage}&limit=${paginationQuery.limit}`,
      },
    };

    return response;
  }
}
