import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthType, User } from '@repo/types';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';

// Type guard for User
function isValidUser(user: unknown): user is User {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'email' in user &&
    typeof (user as User).id === 'string' &&
    typeof (user as User).email === 'string'
  );
}

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    /*
     * Injecting Auth Service
     */
    private readonly authService: AuthService,
  ) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT access and refresh tokens',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC...',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  public async signIn() {
    try {
      // TODO: Implement proper sign-in logic with body parameters
      await Promise.reject(
        new UnauthorizedException('Sign in not implemented yet'),
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('refresh-tokens')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Returns new JWT access and refresh tokens',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC...',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid refresh token',
  })
  public async refreshTokens() {
    try {
      return await this.authService.refreshTokens();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth2 authentication' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth2 callback' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('Google authentication failed');
    }

    if (!isValidUser(req.user)) {
      throw new UnauthorizedException('Invalid user data from Google');
    }

    const tokens = await this.authService.createTokens(req.user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with access token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${tokens.accessToken}`,
    );
  }
}
