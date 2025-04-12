import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateWebhookDto {
  @ApiPropertyOptional({
    description: 'URL to send webhook events to',
    example: 'https://example.com/webhooks/ecocast',
  })
  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  @MaxLength(255)
  url?: string;

  @ApiPropertyOptional({
    description: 'Event types this webhook should receive',
    example: ['cast.created', 'cast.updated', 'user.created'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  events?: string[];

  @ApiPropertyOptional({
    description: 'Description of the webhook',
    example: 'Production webhook for our dashboard integration',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the webhook is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
