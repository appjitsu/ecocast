import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import cacheConfig from '../../config/cache.config';
import { HttpCacheInterceptor } from '../interceptors/cache.interceptor';
import { CacheInvalidationService } from './cache-invalidation.service';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(cacheConfig),
    NestCacheModule.registerAsync({
      imports: [ConfigModule.forFeature(cacheConfig)],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get<number>('cache.ttl'),
        max: configService.get<number>('cache.max'),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
    CacheInvalidationService,
  ],
  exports: [NestCacheModule, CacheInvalidationService],
})
export class CacheModule {}
