import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: true,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User password',
    example: 'StrongPassword123!',
    required: true,
    minLength: 8,
  })
  password: string;
}
