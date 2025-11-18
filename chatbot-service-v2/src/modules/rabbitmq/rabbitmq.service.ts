import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { Logger } from '../../common/utils/logger.util';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private readonly TIMEOUT = 8000; // 8s
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.initConnection();
  }

  private async initConnection() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      Logger.log('✅ RabbitMQ connected', 'RabbitMQ');
    } catch (error) {
      Logger.error('RabbitMQ connection failed', error.message, 'RabbitMQ');
    }
  }

  // Send to Java Spring services via amq.direct exchange
  async send(pattern: string, data: any): Promise<any> {
    if (!this.channel) {
      Logger.warn('RabbitMQ not ready', 'RabbitMQ');
      return null;
    }

    try {
      const correlationId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      
      // Create exclusive reply queue
      const { queue: replyQueue } = await this.channel.assertQueue('', {
        exclusive: true,
        autoDelete: true,
      });

      const message = { pattern, data };

      // Send to exchange with routing key
      this.channel.publish(
        'amq.direct',
        pattern,
        Buffer.from(JSON.stringify(message)),
        {
          correlationId,
          replyTo: replyQueue,
          expiration: this.TIMEOUT.toString(),
          contentType: 'application/json',
        },
      );

      return await this.waitForReply(replyQueue, correlationId);
    } catch (error) {
      Logger.error(`Send error [${pattern}]`, error.message, 'RabbitMQ');
      return null;
    }
  }

  private waitForReply(replyQueue: string, correlationId: string): Promise<any> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.channel.deleteQueue(replyQueue).catch(() => {});
        resolve(null);
      }, this.TIMEOUT);

      this.channel.consume(
        replyQueue,
        (msg: any) => {
          if (msg?.properties.correlationId === correlationId) {
            clearTimeout(timer);
            this.channel.deleteQueue(replyQueue).catch(() => {});
            try {
              resolve(JSON.parse(msg.content.toString()));
            } catch {
              resolve(null);
            }
          }
        },
        { noAck: true },
      );
    });
  }
}
