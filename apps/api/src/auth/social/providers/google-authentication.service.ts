import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import jwtConfig from 'src/auth/config/jwt.config';
import { GoogleTokenDto } from '../dtos/google-token.dto';
import { UsersService } from '../../../users/providers/users.service';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';

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
      console.log('authenticate -> loginTicket', loginTicket);

      // extract the payload from google token
      const {
        email,
        sub: googleId,
        given_name: firstName,
        family_name: lastName,
      } = loginTicket.getPayload();
      console.log('authenticate -> email', email);
      console.log('authenticate -> googleId', googleId);
      console.log('authenticate -> firstName', firstName);
      console.log('authenticate -> lastName', lastName);

      // find user in db using the googleId
      const user = await this.usersService.findOneByGoogleId(googleId);
      console.log('authenticate -> user', user);

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
      console.log('authenticate -> newUser', newUser);

      return this.generateTokensProviders.generateTokens(newUser);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
