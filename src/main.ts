import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RpcCustomExceptionFilter } from './common';

async function bootstrap() {
  // Creating a logger instance to log messages related to the main application
  const logger = new Logger('Main-Gateway');

  const app = await NestFactory.create(AppModule);

  // Setting a global prefix for all routes in the application
  app.setGlobalPrefix('api');

  // Setting up global validation pipes to automatically validate incoming requests based on DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Setting up a global exception filter to handle exceptions thrown by microservices.
  // Global exception filters allow you to catch and handle exceptions in a centralized manner,
  // providing a consistent error response format across the application.
  app.useGlobalFilters(new RpcCustomExceptionFilter());

  await app.listen(envs.port);

  logger.log(`Gateway is running on port ${envs.port}`);
}
void bootstrap();
