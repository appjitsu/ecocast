import {
  ConflictException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';
import { User } from '../user.entity';

@Injectable()
export class UsersCreateManyProvider {
  constructor(
    private readonly dataSource: DataSource,

    private readonly hashingProvider: HashingProvider,
  ) {}
  public async createMany(createManyUserDto: CreateManyUsersDto) {
    const newUsers: User[] = [];
    let queryRunner: QueryRunner | null = null;

    try {
      // create query runner instance
      queryRunner = this.dataSource.createQueryRunner();

      // connect query runner to db
      await queryRunner.connect();
    } catch {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    // start transaction
    await queryRunner.startTransaction();

    try {
      for (const user of createManyUserDto.users) {
        const newUser = queryRunner.manager.create(User, {
          ...user,
          password: await this.hashingProvider.hashPassword(user.password),
        });
        const result = await queryRunner.manager.save(newUser);
        newUsers.push(result);
      }

      // if successful, commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log('Users.CreateMany -> error', error);
      // if error, rollback transaction
      await queryRunner.rollbackTransaction();
      throw new ConflictException('Could not complete the transaction', {
        description: String(error),
      });
    } finally {
      if (queryRunner) {
        await queryRunner.release();
      }
    }

    return newUsers;
  }
}
