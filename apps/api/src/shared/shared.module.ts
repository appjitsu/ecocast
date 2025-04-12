import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig, { createJwtProvider } from '../auth/config/jwt.config';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(createJwtProvider()),
  ],
  exports: [JwtModule, ConfigModule],
})
export class SharedModule {}
