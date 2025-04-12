import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret) {
      throw new UnauthorizedException(
        'Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL: callbackURL || 'http://localhost:4001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const { name, emails, photos } = profile;

      if (!emails || emails.length === 0 || !name) {
        return done(new Error('Invalid profile data from Google'), false);
      }

      const user: GoogleUser = {
        email: emails[0].value,
        firstName: name.givenName || '',
        lastName: name.familyName || '',
        picture: photos && photos.length > 0 ? photos[0].value : '',
        accessToken,
      };

      const userRecord = await this.authService.findOrCreateUserFromOAuth(user);
      if (!userRecord) {
        return done(new Error('Failed to create or find user'), false);
      }
      done(null, userRecord);
    } catch (error) {
      if (error instanceof Error) {
        done(error, false);
      } else {
        done(new Error('Authentication failed'), false);
      }
    }
  }
}
