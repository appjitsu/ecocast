import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateManyUsersDto {
  @ApiProperty({
    type: 'array',
    required: true,
    items: {
      type: 'User',
    },
    description: 'Array of users to be created',
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users: CreateUserDto[];
}
