import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';

@Injectable()
export class FindOneUserByEmailProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  public async findOneByEmail(email: string) {
    let user: User | null = null;
    try {
      const queryBuilder = this.usersRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email });

      user = await queryBuilder.getOne();
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to process your request at the moment',
        {
          description: 'Database error occurred',
          cause: error instanceof Error ? error : undefined,
        },
      );
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
