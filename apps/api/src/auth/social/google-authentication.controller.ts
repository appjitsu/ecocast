import { Body, Controller } from '@nestjs/common';
import { AuthType } from '@repo/types';
import { Auth } from '../decorators/auth.decorator';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { GoogleAuthenticationService } from './providers/google-authentication.service';

@Auth(AuthType.None)
@Controller('google-authentication')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  public async authenticate(@Body() body: GoogleTokenDto) {
    return await this.googleAuthenticationService.authenticate(body);
  }
}
