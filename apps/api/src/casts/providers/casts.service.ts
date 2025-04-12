import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUser, Paginated } from '@repo/types';
import { Repository } from 'typeorm';
import { PaginationProvider } from '../../common/pagination/providers/pagination.provider';
import { WebhookService } from '../../common/webhooks/webhook.service';
import { UsersService } from '../../users/providers/users.service';
import { Cast } from '../cast.entity';
import { CreateCastDTO } from '../dtos/create-cast.dto';
import { GetCastsDto } from '../dtos/get-casts.dto';
import { PatchCastDTO } from '../dtos/patch-cast.dto';
import { CreateCastProvider } from './create-cast.provider';

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
    private readonly webhookService: WebhookService,
  ) {}

  public async findAll(
    userId: string,
    castQuery: GetCastsDto,
  ): Promise<Paginated<Cast>> {
    try {
      const queryBuilder = this.castsRepository
        .createQueryBuilder('cast')
        .where('cast.ownerId = :userId', { userId });

      const casts = await this.paginationProvider.paginateQuery<Cast>(
        {
          limit: castQuery.limit,
          page: castQuery.page,
        },
        queryBuilder,
      );

      return casts;
    } catch {
      throw new RequestTimeoutException('Unable to fetch casts', {
        description: 'Error connecting to the database',
      });
    }
  }

  /**
   *
   * @param createCastDto
   * @param user
   * @returns cast
   */
  public async create(
    createCastDto: CreateCastDTO,
    user: ActiveUser,
  ): Promise<Cast> {
    const cast = await this.createCastProvider.create(createCastDto, user);

    // Dispatch webhook event for the created cast
    await this.webhookService.dispatchEvent('cast.created', cast);

    return cast;
  }

  public async update(castId: number, patchCastDto: PatchCastDTO) {
    let cast: Cast | null = null;

    // Find the Cast
    try {
      // Returns null if the cast does not exist
      cast = await this.castsRepository.findOneBy({
        id: castId,
      });
    } catch {
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

      // Dispatch webhook event for the updated cast
      await this.webhookService.dispatchEvent('cast.updated', cast);

      return cast;
    } catch {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }
  }

  public async delete(id: number): Promise<boolean> {
    // Dispatch webhook event before actually deleting
    const cast = await this.castsRepository.findOne({ where: { id } });
    if (cast) {
      await this.webhookService.dispatchEvent('cast.deleted', {
        id,
        deletedAt: new Date(),
      });
    }

    // Delete the cast
    const result = await this.castsRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
