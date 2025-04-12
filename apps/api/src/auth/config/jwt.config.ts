import { DynamicModule } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';

// Define the expected JWT configuration type
export type JwtConfig = {
  secret: string | undefined;
  audience: string;
  issuer: string;
  accessTokenTtl: number;
  refreshTokenTtl: number;
  googleClientId: string | undefined;
  googleClientSecret: string | undefined;
};

// Register the configuration
const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  audience: process.env.JWT_TOKEN_AUDIENCE || 'ecocast-api',
  issuer: process.env.JWT_TOKEN_ISSUER || 'ecocast',
  accessTokenTtl: parseInt(process.env.JWT_ACCESS_TOKEN_TTL ?? '3600', 10),
  refreshTokenTtl: parseInt(process.env.JWT_REFRESH_TOKEN_TTL ?? '86400', 10),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
}));

// Create a separate provider factory function
export const createJwtProvider = () => ({
  imports: [ConfigModule.forFeature(jwtConfig)] as [DynamicModule],
  inject: [jwtConfig.KEY] as [string | symbol],
  useFactory: (jwtConfig: JwtConfig) => ({
    secret: jwtConfig.secret,
    signOptions: {
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
      expiresIn: jwtConfig.accessTokenTtl,
    },
  }),
});

export default jwtConfig;
