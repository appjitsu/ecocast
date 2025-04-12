import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation } from '@nestjs/swagger';
import { AuthType } from '@repo/types';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';

/**
 * Custom decorator for enabling API Key authentication on a route
 * @returns Decorators for enabling API Key auth
 */
export function ApiKeyAuth() {
  return applyDecorators(
    SetMetadata('auth_type', AuthType.ApiKey),
    UseGuards(ApiKeyAuthGuard),
    ApiHeader({
      name: 'X-API-KEY',
      description: 'API key for authenticating machine-to-machine requests',
      required: true,
    }),
    ApiOperation({
      security: [{ 'api-key': [] }],
    }),
  );
}
