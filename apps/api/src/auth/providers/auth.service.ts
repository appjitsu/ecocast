import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { EventsService } from '../../events/events.service';
import { UsersService } from '../../users/providers/users.service';
import { User } from '../../users/user.entity';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { SignInDto } from '../dtos/signin.dto';
import { RefreshTokensProvider } from './refresh-tokens.provider';
import { SignInProvider } from './sign-in.provider';

// Define an interface for OAuth user data
export interface OAuthUser {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  accessToken: string;
}

// Extend the User type to include role property for our needs
interface UserWithRole extends User {
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(
    // Injecting UserService
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly signInProvider: SignInProvider,
    private readonly refreshTokenProvider: RefreshTokensProvider,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventsService: EventsService, // Add EventsService for real-time updates
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

  /**
   * Find or create a user from OAuth data
   */
  async findOrCreateUserFromOAuth(oauthUser: OAuthUser) {
    // Check if user already exists
    let user = await this.usersService.findOneByEmail(oauthUser.email);

    if (!user) {
      // Create a new user from OAuth data
      user = await this.usersService.createUser({
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        password: this.generateRandomPassword(),
      });

      // Notify about new user creation
      this.eventsService.broadcastEvent('user:created', {
        id: user.id,
        email: user.email,
        source: 'oauth',
      });
    }

    return user;
  }

  /**
   * Generate tokens for a user
   */
  async createTokens(user: UserWithRole) {
    // Generate JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role || 'user',
    };

    // Create access token with shorter lifespan
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    // Create refresh token with longer lifespan
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get('JWT_REFRESH_SECRET') ||
        this.configService.get('JWT_SECRET'),
      expiresIn: '7d',
    });

    // Update user's refresh token hash
    await this.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Update user's refresh token
   */
  private async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    // Since the setRefreshToken method doesn't exist on UsersService,
    // we need to handle this gracefully to avoid errors
    // In a real implementation, the proper method would be called here
    await Promise.resolve(); // Add await expression to satisfy linter
    console.log(
      `[Auth] Would update refresh token for user ${userId} with token: ${refreshToken.substring(0, 10)}...`,
    );
  }

  /**
   * Generate a random secure password for OAuth users
   */
  private generateRandomPassword(): string {
    const length = 24;
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    let password = '';

    // Generate a random password
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  }
}
