import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthType } from '@repo/types';
import { AUTH_TYPE_KEY } from '../../constants/auth.constants';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { ApiKeyGuard } from '../api-key/api-key.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;
  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  >;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
      [AuthType.ApiKey]: this.apiKeyGuard,
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    const guards = authTypes
      .map((type: AuthType) => this.authTypeGuardMap[type])
      .flat();

    for (const instance of guards) {
      try {
        const canActivate = await instance.canActivate(context);
        if (canActivate) {
          return true;
        }
      } catch {
        continue;
      }
    }

    throw new UnauthorizedException();
  }
}
