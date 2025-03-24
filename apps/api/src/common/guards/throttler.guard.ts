import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(
    req: Record<string, any>,
  ): Promise<string> {
    return req.ip;
  }

  public override async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const skipThrottling = this.shouldSkipThrottling(request.path);

    if (skipThrottling) {
      return true;
    }

    return super.canActivate(context);
  }

  private shouldSkipThrottling(path: string): boolean {
    // Add paths that should skip throttling
    const excludedPaths = ['/health', '/metrics'];
    return excludedPaths.some((excluded) => path.startsWith(excluded));
  }
}
