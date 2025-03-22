import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { Cast } from '../cast.entity';
import { GetCastsDto } from '../dtos/get-casts.dto';
import { PatchCastDTO } from '../dtos/patch-cast.dto';
import { CreateCastProvider } from './create-cast.provider';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { CreateCastDTO } from '../dtos/create-cast.dto';

@Injectable()
export class CastsService {
  constructor(
    /*
     * Injecting Users Service
     */
    private readonly usersService: UsersService,
    /**
     * Inject castsRepository
     */
    @InjectRepository(Cast)
    private readonly castsRepository: Repository<Cast>,
    /**
     * Injecting Pagination Provider
     */
    private readonly paginationProvider: PaginationProvider,
    /**
     * Injecting Create Cast Provider
     */
    private readonly createCastProvider: CreateCastProvider,
  ) {}

  public async findAll(
    userId: string,
    castQuery: GetCastsDto,
  ): Promise<Paginated<Cast>> {
    const casts = await this.paginationProvider.paginateQuery(
      {
        limit: castQuery.limit,
        page: castQuery.page,
      },
      this.castsRepository,
    );

    return casts;
  }

  /**
   *
   * @param createCastDto
   * @param user
   * @returns cast
   */
  public async create(createCastDto: CreateCastDTO, user: IActiveUser) {
    return await this.createCastProvider.create(createCastDto, user);
  }

  public async update(castId: number, patchCastDto: PatchCastDTO) {
    let cast = undefined;

    // Find the Cast
    try {
      // Returns null if the cast does not exist
      cast = await this.castsRepository.findOneBy({
        id: castId,
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    if (!cast) {
      throw new BadRequestException('Cast not found');
    }

    try {
      cast = await this.castsRepository.save({
        ...cast,
        ...patchCastDto,
      });

      return cast;
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }
  }

  public async delete(id: number) {
    // Deleting the cast
    await this.castsRepository.delete(id);
    // confirmation
    return { deleted: true, id };
  }
}
