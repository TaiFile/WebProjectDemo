import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api', {
    exclude: ['webhooks/mercadopago'],
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`💚 Health check: http://localhost:${port}/api/health`);
}

bootstrap();
