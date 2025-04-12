import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import cacheConfig from '../../config/cache.config';
import { HttpCacheInterceptor } from '../interceptors/cache.interceptor';
import { CacheInvalidationService } from './cache-invalidation.service';

@Module({
  imports: [
    ConfigModule.forFeature(cacheConfig),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [cacheConfig.KEY],
      useFactory: async (config: ConfigType<typeof cacheConfig>) => {
        const cacheOptions = {
          ttl: config.ttl,
          max: config.max,
        };

        return cacheOptions;
      },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
    CacheInvalidationService,
  ],
  exports: [CacheInvalidationService],
})
export class CacheInterceptorModule {}
