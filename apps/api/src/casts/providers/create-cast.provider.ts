import { Body, ConflictException, Injectable } from '@nestjs/common';
import { CreateCastDTO } from '../dtos/create-cast.dto';
import { Repository } from 'typeorm';
import { Cast } from '../cast.entity';
import { UsersService } from 'src/users/providers/users.service';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { InjectRepository } from '@nestjs/typeorm';

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
  public async create(@Body() createCastDto: CreateCastDTO, user: IActiveUser) {
    let owner = undefined;

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
