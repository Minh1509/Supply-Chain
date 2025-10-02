import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WinstonModule } from 'nest-winston';
import { getWinstonConfig } from './common/utilities/log.util';
import { getAppConfig } from './config';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const { appName, isProductionEnv } = getAppConfig();

  const logger = WinstonModule.createLogger(getWinstonConfig(appName));

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: process.env.RABBITMQ_QUEUE,
      queueOptions: {
        durable: true,
      },
    },
    logger,
  });
  const reflector = app.get(Reflector);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  await app.listen();

  !isProductionEnv &&
    logger.log({
      message: `Microservice ${appName} is listening with queue: ${process.env.RABBITMQ_QUEUE}`,
      context: 'Bootstrap',
    });
}

bootstrap();
