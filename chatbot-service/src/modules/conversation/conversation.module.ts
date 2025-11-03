import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import Redis from 'ioredis';
import { RABBITMQ_CONSTANTS } from 'src/common/constants';
import { ConversationService } from './conversation.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_CONSTANTS.AUTH.name,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url')],
            queue: configService.get<string>('rabbitmq.authQueue'),
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: RABBITMQ_CONSTANTS.BUSINESS.name,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url')],
            queue: configService.get<string>('rabbitmq.businessQueue'),
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: RABBITMQ_CONSTANTS.GENERAL.name,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url')],
            queue: configService.get<string>('rabbitmq.generalQueue'),
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: RABBITMQ_CONSTANTS.INVENTORY.name,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url')],
            queue: configService.get<string>('rabbitmq.inventoryQueue'),
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: RABBITMQ_CONSTANTS.OPERATION.name,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url')],
            queue: configService.get<string>('rabbitmq.operationQueue'),
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
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
