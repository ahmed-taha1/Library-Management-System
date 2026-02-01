import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config';

async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Retrieve the configuration service
  const configService = app.get(AppConfigService);

  // Start the application and listen on the configured port
  await app.listen(configService.PORT);
}
bootstrap();
