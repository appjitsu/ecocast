import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@repo/types';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async createTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async refreshTokens() {
    // Implementation for token refresh
    return this.createTokens({} as User); // TODO: Implement proper refresh logic
  }

  async findOrCreateUserFromOAuth(user: GoogleUser): Promise<User | undefined> {
    // TODO: Implement proper user creation/finding logic
    // Simulating async operation
    await new Promise((resolve) => setTimeout(resolve, 0));
    return {
      id: '1',
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      password: '',
    };
  }
}
