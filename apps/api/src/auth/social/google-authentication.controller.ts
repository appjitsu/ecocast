import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthType } from '@repo/types';
import { Auth } from '../decorators/auth.decorator';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { GoogleAuthenticationService } from './providers/google-authentication.service';

@Auth(AuthType.None)
@Controller('google-authentication')
@ApiTags('auth')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with Google OAuth token' })
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
    description: 'Unauthorized - Invalid Google token',
  })
  public async authenticate(@Body() body: GoogleTokenDto) {
    return await this.googleAuthenticationService.authenticate(body);
  }
}
