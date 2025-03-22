import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { UsersService } from '../../users/providers/users.service';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { SignInDto } from '../dtos/signin.dto';
import { RefreshTokensProvider } from './refresh-tokens.provider';
import { SignInProvider } from './sign-in.provider';

@Injectable()
export class AuthService {
  constructor(
    // Injecting UserService
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly signInProvider: SignInProvider,
    private readonly refreshTokenProvider: RefreshTokensProvider,
  ) {}

  public async signIn(body: SignInDto) {
    return await this.signInProvider.signIn(body);
  }

  public async refreshTokens(body: RefreshTokenDto) {
    return await this.refreshTokenProvider.refreshTokens(body);
  }

  public isAuth() {
    return true;
  }
}
