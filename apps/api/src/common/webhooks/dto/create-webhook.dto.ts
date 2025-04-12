import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({
    description: 'URL to send webhook events to',
    example: 'https://example.com/webhooks/ecocast',
  })
  @IsNotEmpty()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  @MaxLength(255)
  url: string;

  @ApiProperty({
    description: 'Event types this webhook should receive',
    example: ['cast.created', 'cast.updated', 'user.created'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  events: string[];

  @ApiPropertyOptional({
    description: 'Description of the webhook',
    example: 'Production webhook for our dashboard integration',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
