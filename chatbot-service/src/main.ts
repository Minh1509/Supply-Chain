import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getAppConfig, getRabbitmqConfig } from './config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const { appName, appPort, isProductionEnv } = getAppConfig();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Setup RabbitMQ microservice
  const rabbitmqConfig = configService.get('rabbitmq');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqConfig.url],
      queue: rabbitmqConfig.queue,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  !isProductionEnv &&
    logger.log(
      `Microservice ${appName} is listening with queue: ${rabbitmqConfig.queue}`,
    );

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(appPort);
  !isProductionEnv && logger.log(`${appName} is running on PORT: ${appPort}`);
  !isProductionEnv && logger.log(`WebSocket available at ws://localhost:${appPort}/chat`);
}

bootstrap();
