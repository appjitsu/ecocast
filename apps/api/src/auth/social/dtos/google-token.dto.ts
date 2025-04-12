import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class GoogleTokenDto {
  @IsNotEmpty()
  @MaxLength(512)
  @ApiProperty({
    description: 'Google OAuth ID token',
    example: 'ya29.a0AfB_byCUH...',
    required: true,
    maxLength: 512,
  })
  token: string;
}
