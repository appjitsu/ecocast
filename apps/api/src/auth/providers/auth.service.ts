import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { UsersService } from 'src/users/providers/users.service';
import { SignInDto } from '../dtos/signin.dto';
import { SignInProvider } from './sign-in.provider';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RefreshTokensProvider } from './refresh-tokens.provider';

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
