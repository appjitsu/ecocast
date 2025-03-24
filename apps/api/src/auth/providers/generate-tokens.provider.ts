import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ActiveUser } from '@repo/types';
import { User } from '../../users/user.entity';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class GenerateTokensProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  /**
   * Description placeholder
   *
   * @public
   * @async
   * @template T
   * @param {number} userId
   * @param {number} expiresIn
   * @param {?T} [payload]
   * @returns Promise<string>
   */
  public async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
        expiresIn: expiresIn,
      },
    );
  }

  /**
   * Description placeholder
   *
   * @public
   * @async
   * @param {User} user
   * @returns Promise<{ access_token: string; refresh_token: string }>
   */
  public async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      // generate access token
      this.signToken<Partial<ActiveUser>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
        },
      ),
      // generate refresh token
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
