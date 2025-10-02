import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getAppConfig } from './config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const { appName, appPort, isProductionEnv, trustProxy } = getAppConfig();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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

  app.enableCors({ origin: '*' });
  await app.listen(appPort);
  !isProductionEnv && logger.log(`${appName} is running on PORT: ${appPort}`);
}

bootstrap();
