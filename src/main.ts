import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfigService } from './config';
import { TransformInterceptor, LoggingInterceptor } from './common/interceptors';
import { GlobalExceptionFilter } from './common/filters';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(AppConfigService);

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  app.setGlobalPrefix('api');

  await app.listen(configService.PORT);
  logger.log(`Application running on port ${configService.PORT}`);
}
bootstrap();
