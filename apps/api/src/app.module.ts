// import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import jwtConfig, { createJwtProvider } from './auth/config/jwt.config';
import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';
import { CastsModule } from './casts/casts.module';
import { CacheModule as CommonCacheModule } from './common/cache/cache.module';
import { CompressionMiddleware } from './common/compression/compression.middleware';
import { HttpCacheInterceptor } from './common/interceptors/cache.interceptor';
import { LoggingModule } from './common/logging/logging.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ResponseTimeMiddleware } from './common/middleware/response-time.middleware';
import { PerformanceModule } from './common/performance/performance.module';
import { SanitizationPipe } from './common/pipes/sanitization.pipe';
import { SecurityModule } from './common/security/security.module';
import { WebhookModule } from './common/webhooks/webhook.module';
import appConfig from './config/app.config';
import cacheConfig from './config/cache.config';
import { configSchema } from './config/config.schema';
import databaseConfig from './config/database.config';
import environmentValidation from './config/environment.validation';
import queueConfig from './config/queue.config';
import { DatabaseQueryLogger } from './database/query-logger';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { SharedModule } from './shared/shared.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

const ENV = process.env.NODE_ENV;

@Module({
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: SanitizationPipe,
    },
  ],
  imports: [
    UsersModule,
    CastsModule,
    AuthModule,
    HealthModule,
    EventsModule,
    UploadsModule,
    CommonCacheModule,
    LoggingModule,
    PerformanceModule,
    MetricsModule,
    SecurityModule,
    SharedModule,
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(cacheConfig),
    JwtModule.registerAsync(createJwtProvider()),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig, jwtConfig, cacheConfig, queueConfig],
      validate: (config) => {
        const result = environmentValidation.safeParse(config);
        if (!result.success) {
          throw new Error(result.error.message);
        }
        return result.data;
      },
      validationSchema: configSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [cacheConfig.KEY],
      useFactory: (config: ConfigType<typeof cacheConfig>) => {
        const cacheOptions = {
          ttl: config.ttl,
          max: config.max,
        };

        // Always return base options (uses default in-memory store)
        return cacheOptions;
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [databaseConfig.KEY],
      useFactory: (dbConfig: ConfigType<typeof databaseConfig>) => {
        // Create a query logger instance with only the options object
        const queryLogger = new DatabaseQueryLogger({
          slowQueryThreshold: dbConfig.slowQueryThreshold,
          logAllQueries: dbConfig.logAllQueries,
        });

        const baseOptions = {
          type: 'postgres' as const,
          synchronize: dbConfig.synchronize,
          autoLoadEntities: dbConfig.autoLoadEntities,
          logging: queryLogger.getLoggerOptions(),
          logger: queryLogger,
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          maxQueryExecutionTime: dbConfig.slowQueryThreshold,
          poolSize: dbConfig.poolSize,
          // SSL is handled by the URL or individual params below
        };

        if (dbConfig.url) {
          // If URL is provided by the config (from DATABASE_URL env var)
          return {
            ...baseOptions,
            url: dbConfig.url,
          };
        } else {
          // Otherwise, use individual parameters (fallback for local dev)
          return {
            ...baseOptions,
            host: dbConfig.host,
            port: dbConfig.port,
            username: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.name,
            ssl: dbConfig.ssl
              ? {
                  rejectUnauthorized: dbConfig.rejectUnauthorized,
                }
              : false,
          };
        }
      },
    }),
    WebhookModule,
    /*
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    */
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply request ID middleware first for tracing
    consumer.apply(RequestIdMiddleware).forRoutes('*');

    // Apply response time tracking middleware
    consumer.apply(ResponseTimeMiddleware).forRoutes('*');

    // Apply Compression middleware to all routes
    consumer.apply(CompressionMiddleware).forRoutes('*');

    // Apply CSRF middleware to all routes
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}
