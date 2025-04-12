import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

interface AuthenticatedRequest {
  isAuthenticated(): boolean;
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.isAuthenticated();
  }
}
