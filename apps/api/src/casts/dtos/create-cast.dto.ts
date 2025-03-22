import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { castCategory } from '../enums/castCategory.enum';
import { castStatus } from '../enums/castStatus.enum';

export class CreateCastDTO {
  @ApiProperty({
    example: 'This is a title',
    description: 'This is the title for the cast',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(512)
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    enum: castCategory,
    description: "Possible values, 'cast', 'page', 'story', 'series'",
  })
  @IsEnum(castCategory)
  @IsNotEmpty()
  castCategory: castCategory;

  @ApiProperty({
    description: "For Example - 'my-url'",
    example: 'my-blog-cast',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @MinLength(4)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'A slug should be all small letters and uses only "-" and without spaces. For example "my-url"',
  })
  slug: string;

  @ApiProperty({
    enum: castStatus,
    description: "Possible values 'draft', 'scheduled', 'review', 'published'",
  })
  @IsEnum(castStatus)
  @IsNotEmpty()
  status: castStatus;

  @ApiPropertyOptional({
    description: 'This is the content of the cast',
    example: 'The cast content',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Voice of the cast narration',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['john', 'jane'])
  voice?: string;

  @ApiPropertyOptional({
    description: 'Voice over URL of the cast',
    example: 'http://localhost.com/audio.mp3',
  })
  @IsOptional()
  @MinLength(4)
  @MaxLength(1024)
  @IsUrl()
  voiceOverUrl?: string;

  @ApiPropertyOptional({
    description: 'Featured image for your cast',
    example: 'http://localhost.com/images/image1.jpg',
  })
  @IsOptional()
  @MinLength(4)
  @MaxLength(1024)
  @IsUrl()
  featuredImageUrl?: string;

  @ApiPropertyOptional({
    description: 'The date on which the cast is scheduled',
    example: '2024-03-16T07:46:32+0000',
  })
  @IsDate()
  @IsOptional()
  scheduledFor?: Date;

  @ApiPropertyOptional({
    description: 'The date on which the cast is published',
    example: '2024-03-16T07:46:32+0000',
  })
  @IsDate()
  @IsOptional()
  publishedOn?: Date;
}
