import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
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
  const config = new DocumentBuilder()
    .setTitle('EcoCast API')
    .setDescription('API for generating news podcasts')
    .setTermsOfService(`${process.env.HOST}:${process.env.PORT}`)
    .setLicense('MIT License', 'https://opensource.org/licenses/MIT')
    .addServer(`${process.env.HOST}:${process.env.PORT}`)
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the server
  const port = process.env.PORT || 3001;
  console.log(port);
  app.enableCors();
  await app.listen(port);

  // Use Pino logger
  const logger = app.get(PinoLogger);
  logger.log(
    `Server running on port ${port}, env: ${process.env.NODE_ENV || 'unknown'}`,
  );
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
