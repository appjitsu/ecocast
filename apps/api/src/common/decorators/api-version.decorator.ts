import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

/**
 * API version metadata key
 */
export const API_VERSION_KEY = 'api_version';

/**
 * Available API versions
 */
export enum ApiVersion {
  V1 = '1',
  V2 = '2',
}

/**
 * Decorator to set API version for a controller or route
 * @param version API version to use
 */
export function ApiVersioned(version: ApiVersion = ApiVersion.V1) {
  return applyDecorators(
    SetMetadata(API_VERSION_KEY, version),
    ApiHeader({
      name: 'x-api-version',
      description: 'API Version',
      required: false,
      schema: {
        type: 'string',
        default: version,
        enum: Object.values(ApiVersion),
      },
    }),
  );
}
