import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { OAuth2Client } from 'google-auth-library';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import jwtConfig, { createJwtProvider } from './config/jwt.config';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';
import { ApiKeyGuard } from './guards/api-key/api-key.guard';
import { AuthenticationGuard } from './guards/authentication/authentication.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { BcryptProvider } from './providers/bcrypt.provider';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { HashingProvider } from './providers/hashing.provider';
import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
import { SignInProvider } from './providers/sign-in.provider';
import { GoogleAuthenticationController } from './social/google-authentication.controller';
import { GoogleAuthenticationService } from './social/providers/google-authentication.service';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Global()
@Module({
  controllers: [AuthController, GoogleAuthenticationController],
  providers: [
    AuthService,
    { provide: HashingProvider, useClass: BcryptProvider },
    SignInProvider,
    GenerateTokensProvider,
    RefreshTokensProvider,
    GoogleAuthenticationService,
    AccessTokenGuard,
    RefreshTokenGuard,
    ApiKeyGuard,
    AuthenticationGuard,
    ApiKeyStrategy,
    {
      provide: OAuth2Client,
      useFactory: (configService: ConfigService) => {
        const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        if (!clientId || !clientSecret) {
          return null;
        }
        return new OAuth2Client({
          clientId,
          clientSecret,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: GoogleStrategy,
      useFactory: (configService: ConfigService, authService: AuthService) => {
        const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        if (!clientId || !clientSecret) {
          return null;
        }
        return new GoogleStrategy(configService, authService);
      },
      inject: [ConfigService, AuthService],
    },
  ],
  imports: [
    forwardRef(() => UsersModule),
    SharedModule,
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync(createJwtProvider()),
  ],
  exports: [
    AuthService,
    HashingProvider,
    AccessTokenGuard,
    RefreshTokenGuard,
    ApiKeyGuard,
    AuthenticationGuard,
  ],
})
export class AuthModule {}
