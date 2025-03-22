import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ActiveUser } from '@repo/types';
import { UsersService } from 'src/users/providers/users.service';
import jwtConfig from '../config/jwt.config';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { GenerateTokensProvider } from './generate-tokens.provider';

@Injectable()
export class RefreshTokensProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly generateTokensProvider: GenerateTokensProvider,
    private readonly usersService: UsersService,
  ) {}
  public async refreshTokens(tokenData: RefreshTokenDto) {
    try {
      // verify the refresh token using jwt service
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUser, 'sub'>
      >(tokenData.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      // fetch user from db using user service
      const user = await this.usersService.findOneById(sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // generate new tokens
      return await this.generateTokensProvider.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
