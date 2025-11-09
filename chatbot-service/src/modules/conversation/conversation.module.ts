import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RABBITMQ_CONSTANTS } from 'src/common/constants';
import { rabbitmqConfiguration } from 'src/config';
import { ConversationService } from './conversation.service';

@Module({
  imports: [
    ClientsModule.registerAsync(
      Object.values(RABBITMQ_CONSTANTS).map((svc) => ({
        name: svc.name,
        imports: [ConfigModule],
        inject: [rabbitmqConfiguration.KEY],
        useFactory: (rabbitmqConfig: ConfigType<typeof rabbitmqConfiguration>) => ({
          transport: Transport.RMQ,
          options: {
            urls: [rabbitmqConfig.url],
            queue: svc.queue,
            queueOptions: { durable: true },
          },
        }),
      })),
    ),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get('redis');
        return new Redis({
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.db,
        });
      },
      inject: [ConfigService],
    },
    ConversationService,
  ],
  exports: [ClientsModule, 'REDIS_CLIENT', ConversationService],
})
export class ConversationModule {}
