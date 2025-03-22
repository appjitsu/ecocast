import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../../../users/providers/users.service';
import jwtConfig from '../../config/jwt.config';
import { GenerateTokensProvider } from '../../providers/generate-tokens.provider';
import { GoogleTokenDto } from '../dtos/google-token.dto';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly generateTokensProviders: GenerateTokensProvider,
  ) {}

  onModuleInit() {
    const clientId = this.jwtConfiguration.googleClientId;
    const clientSecret = this.jwtConfiguration.googleClientSecret;

    this.oauthClient = new OAuth2Client({
      clientId,
      clientSecret,
    });
  }

  public async authenticate(tokenData: GoogleTokenDto) {
    try {
      // verify the google token
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: tokenData.token,
      });

      // extract the payload from google token
      const payload = loginTicket.getPayload();
      if (!payload?.email || !payload.sub) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      const {
        email,
        sub: googleId,
        given_name: firstName = '',
        family_name: lastName = '',
      } = payload;

      // find user in db using the googleId
      const user = await this.usersService.findOneByGoogleId(googleId);

      // if user exists, generate token
      if (user) {
        return this.generateTokensProviders.generateTokens(user);
      }

      const newUser = await this.usersService.createGoogleUser({
        email,
        googleId,
        firstName,
        lastName,
      });

      return this.generateTokensProviders.generateTokens(newUser);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
