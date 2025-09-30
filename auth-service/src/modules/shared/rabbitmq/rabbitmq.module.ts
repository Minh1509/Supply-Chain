import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { rabbitmqConfiguration } from 'src/config';

@Module({
  imports: [
    ClientsModule.registerAsync(
      Object.values(RABBITMQ_CONSTANTS).map((svc) => ({
        name: svc.name,
        inject: [rabbitmqConfiguration.KEY],
        useFactory: (rabbitmqConfig: ConfigType<typeof rabbitmqConfiguration>) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqConfig.url],
              queue: svc.queue,
              queueOptions: { durable: true },
            },
          };
        },
      })),
    ),
  ],

  exports: [ClientsModule],
})
export class RabbitmqModule {}
