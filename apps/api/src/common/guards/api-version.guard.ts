import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  API_VERSION_KEY,
  ApiVersion,
} from '../decorators/api-version.decorator';

@Injectable()
export class ApiVersionGuard implements CanActivate {
  private readonly logger = new Logger(ApiVersionGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the API version from the controller or handler metadata
    const requiredVersion = this.reflector.getAllAndOverride<ApiVersion>(
      API_VERSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no version is specified, allow the request
    if (!requiredVersion) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Get the version from the header or default to v1
    const providedVersion = this.getVersionFromRequest(request);

    // Check if the provided version matches the required version
    const isVersionMatch = providedVersion === requiredVersion;

    if (!isVersionMatch) {
      this.logger.debug(
        `API version mismatch: Required ${requiredVersion}, provided ${providedVersion}`,
        {
          path: request.path,
          method: request.method,
          requiredVersion,
          providedVersion,
        },
      );
    }

    return isVersionMatch;
  }

  /**
   * Extract API version from the request
   */
  private getVersionFromRequest(request: Request): ApiVersion {
    // Try to get version from header
    const headerVersion = request.headers['x-api-version'] as string;
    if (
      headerVersion &&
      Object.values(ApiVersion).includes(headerVersion as ApiVersion)
    ) {
      return headerVersion as ApiVersion;
    }

    // Try to get version from the path
    const pathVersion = this.getVersionFromPath(request.path);
    if (pathVersion) {
      return pathVersion;
    }

    // Default to v1
    return ApiVersion.V1;
  }

  /**
   * Extract API version from the URL path
   */
  private getVersionFromPath(path: string): ApiVersion | null {
    // Match /v1/ or /v2/ in the path
    const versionMatch = path.match(/\/v(\d+)\//i);
    if (versionMatch && versionMatch[1]) {
      const version = versionMatch[1];
      if (Object.values(ApiVersion).includes(version as ApiVersion)) {
        return version as ApiVersion;
      }
    }

    return null;
  }
}
