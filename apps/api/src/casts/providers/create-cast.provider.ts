import { Body, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUser } from '@repo/types';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/providers/users.service';
import { User } from '../../users/user.entity';
import { Cast } from '../cast.entity';
import { CreateCastDTO } from '../dtos/create-cast.dto';
@Injectable()
export class CreateCastProvider {
  constructor(
    @InjectRepository(Cast)
    private readonly castsRepository: Repository<Cast>,
    private readonly usersService: UsersService,
  ) {}
  /**
   * Creating new casts
   */
  public async create(
    @Body() createCastDto: CreateCastDTO,
    user: ActiveUser,
  ): Promise<Cast> {
    let owner: User | null = null;

    try {
      // Find user from database based on userId
      owner = await this.usersService.findOneById(user.sub);
    } catch (error) {
      throw new ConflictException(error);
    }

    // Create cast
    const cast = this.castsRepository.create({
      ...createCastDto,
      owner,
    });

    try {
      // return the cast
      return await this.castsRepository.save(cast);
    } catch (error) {
      throw new ConflictException(error, {
        description:
          'Unable to process your request at the moment please try later',
      });
    }
  }
}
