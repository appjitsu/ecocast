import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/interceptors/error.interceptor';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { initializeDatabase } from './database/startup';

// Critical environment variables that must be set
const CRITICAL_ENV_VARS = [
  'JWT_SECRET',
  'DATABASE_HOST',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
];

// Helper to validate environment variables
function validateEnvVars() {
  const missing = CRITICAL_ENV_VARS.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.error(
      `Missing critical environment variables: ${missing.join(', ')}`,
    );
    return false;
  }

  return true;
}

async function bootstrap() {
  try {
    // Validate required environment variables
    if (!validateEnvVars()) {
      process.exit(1);
    }

    // Run database migrations
    await initializeDatabase();

    const app = await NestFactory.create(AppModule, {
      bufferLogs: true, // Buffer logs until Pino is ready
    });

    // Compression is now handled by CompressionMiddleware

    // RE-ADD Apply security headers with Helmet block
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: [`'self'`],
            scriptSrc: [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`],
            styleSrc: [
              `'self'`,
              `'unsafe-inline'`,
              'https://fonts.googleapis.com',
            ],
            fontSrc: [`'self'`, 'https://fonts.gstatic.com'],
            imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
            connectSrc: [`'self'`],
            frameSrc: [`'none'`],
            objectSrc: [`'none'`],
            baseUri: [`'self'`],
            formAction: [`'self'`],
            frameAncestors: [`'none'`],
            manifestSrc: [`'self'`],
            workerSrc: [`'self'`, 'blob:'],
            reportUri: '/security/csp-report',
            reportTo: 'csp-endpoint',
            upgradeInsecureRequests: [],
          },
          reportOnly: process.env.NODE_ENV !== 'production', // Only report in non-production
        },
        xssFilter: true,
        hidePoweredBy: true,
        noSniff: true,
        referrerPolicy: { policy: 'same-origin' },
        hsts: {
          maxAge: 31536000, // 1 year in seconds
          includeSubDomains: true,
          preload: true,
        },
      }),
    );

    // Add Report-To header for modern browsers
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || 3000;
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader(
        'Report-To',
        JSON.stringify({
          group: 'csp-endpoint',
          max_age: 10886400,
          endpoints: [
            {
              url: `${process.env.API_URL || `http://${host}:${port}`}/security/csp-report`,
            },
          ],
        }),
      );
      next();
    });

    // Parse cookies
    app.use(cookieParser());

    // RE-ADD Add CSRF protection block
    if (process.env.NODE_ENV === 'production') {
      const { generateToken, doubleCsrfProtection } = doubleCsrf({
        getSecret: () =>
          process.env.SESSION_SECRET ||
          process.env.JWT_SECRET ||
          'keyboard_cat',
        cookieName: 'x-csrf-token',
        cookieOptions: {
          path: '/',
          domain: process.env.COOKIE_DOMAIN,
          signed: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        },
        size: 64,
        ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
        getTokenFromRequest: (req: Request) =>
          req.headers['x-csrf-token'] as string,
      });

      // Custom middleware to skip CSRF for certain paths
      app.use((req: Request, res: Response, next: NextFunction) => {
        const path = req.originalUrl || req.url;
        if (
          path.startsWith('/api/docs') ||
          path === '/health' ||
          path.startsWith('/auth/')
        ) {
          return next();
        }
        return doubleCsrfProtection(req, res, next);
      });

      // Add CSRF token generator to app
      app.use(
        (
          req: Request & { csrfToken?: () => string },
          _res: Response,
          next: NextFunction,
        ) => {
          const token = generateToken(_res, req);
          req.csrfToken = () => token;
          next();
        },
      );
    }

    app.useGlobalPipes(new CustomValidationPipe());

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Initialize Sentry for error tracking
    // TODO: Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0 });

    // ADD Swagger setup back
    const config = new DocumentBuilder()
      .setTitle('EcoCast API')
      .setDescription('API for creating and managing eco-focused content')
      .setVersion('1.0')
      .setContact(
        'EcoCast Team',
        'https://ecocast.example.com',
        'support@ecocast.example.com',
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .setExternalDoc('API Documentation', 'https://docs.ecocast.example.com')
      .addServer(
        process.env.API_URL || `http://${host}:${port}`,
        'Current Environment',
      )
      .addServer('https://api.ecocast.example.com/v1', 'Production')
      .addServer('https://staging-api.ecocast.example.com/v1', 'Staging')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('casts', 'Content management endpoints')
      .addTag('uploads', 'File upload endpoints')
      .addTag('system', 'System health and monitoring')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-KEY',
          in: 'header',
          description: 'API key for machine-to-machine communication',
        },
        'api-key',
      )
      .addOAuth2(
        {
          type: 'oauth2',
          flows: {
            implicit: {
              authorizationUrl: 'auth/google',
              scopes: {
                email: 'View your email',
                profile: 'View your basic profile info',
              },
            },
          },
        },
        'google-oauth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        deepLinking: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        tryItOutEnabled: true,
        supportedSubmitMethods: ['get', 'put', 'post', 'delete', 'patch'],
      },
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'EcoCast API Documentation',
    });

    // Server configuration
    const corsOrigin = process.env.CORS_ORIGIN || '*';
    const corsOrigins =
      corsOrigin !== '*'
        ? corsOrigin.split(',').map((origin) => origin.trim())
        : '*';

    app.enableCors({
      origin: process.env.NODE_ENV === 'production' ? corsOrigins : '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Cache-Control',
        'Pragma',
        'Expires',
        'Accept',
        'X-CSRF-Token',
      ],
      exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
      maxAge: 86400, // 24 hours in seconds - how long the results of a preflight request can be cached
    });

    await app.listen(port);

    // Use Pino logger
    const logger = app.get(PinoLogger);
    logger.log(
      `Server running on port ${port}, env: ${process.env.NODE_ENV || 'unknown'}`,
    );
    logger.log(
      `Swagger documentation available at http://${host}:${port}/api/docs`,
    );
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

void bootstrap().catch((error) => {
  console.error('Unhandled error during bootstrap:', error);
  process.exit(1);
});
