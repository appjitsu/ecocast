import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { initializeDatabase } from './database/startup';

async function bootstrap() {
  try {
    // Run database migrations
    await initializeDatabase();

    const app = await NestFactory.create(AppModule, {
      bufferLogs: true, // Buffer logs until Pino is ready
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Initialize Sentry for error tracking
    // TODO: Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0 });

    // Set up Swagger documentation
    // const config = new DocumentBuilder()
    //   .setTitle('EcoCast API')
    //   .setDescription('API for generating news podcasts')
    //   .setTermsOfService(`${process.env.HOST}:${process.env.PORT}`)
    //   .setLicense('MIT License', 'https://opensource.org/licenses/MIT')
    //   .addServer(`${process.env.HOST}:${process.env.PORT}`)
    //   .setVersion('1.0')
    //   .build();
    // const document = SwaggerModule.createDocument(app, config);
    // SwaggerModule.setup('api', app, document);

    // Start the server
    const port = process.env.PORT || 3001;
    app.enableCors({
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
      ],
    });
    await app.listen(port);

    // Use Pino logger
    const logger = app.get(PinoLogger);
    logger.log(
      `Server running on port ${port}, env: ${process.env.NODE_ENV || 'unknown'}`,
    );
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
