import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Logger } from '../../common/utils/logger.util';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private readonly DEFAULT_TIMEOUT = 10000; // 10s default
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

  async checkHealth(): Promise<boolean> {
    return this.channel !== undefined && this.connection !== undefined;
  }

  // Send to Java Spring services via queue
  // Supports 2 formats:
  // 1. send('queue_name', { pattern, data }) - new format
  // 2. send('pattern', data) - legacy format (backward compatible)
  async send(queueOrPattern: string, payloadOrData: any): Promise<any> {
    if (!this.channel) {
      Logger.warn('RabbitMQ not ready', 'RabbitMQ');
      return null;
    }

    const timeout = this.getTimeout(queueOrPattern);
    const startTime = Date.now();

    try {
      const correlationId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      // Create exclusive reply queue
      const { queue: replyQueue } = await this.channel.assertQueue('', {
        exclusive: true,
        autoDelete: true,
      });

      // Determine format: new (queue + payload) or legacy (pattern + data)
      let queueName: string;
      let message: any;

      if (payloadOrData && typeof payloadOrData === 'object' && 'pattern' in payloadOrData) {
        // New format: send('queue_name', { pattern, data })
        queueName = queueOrPattern;
        message = payloadOrData;
      } else {
        // Legacy format: send('pattern', data)
        queueName = queueOrPattern;
        message = { pattern: queueOrPattern, data: payloadOrData };
      }

      // Send to queue
      this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: replyQueue,
        expiration: timeout.toString(),
        contentType: 'application/json',
      });

      const result = await this.waitForReply(replyQueue, correlationId, timeout);

      const responseTime = Date.now() - startTime;
      if (responseTime > 5000) {
        Logger.warn(
          `⚠️ Slow RabbitMQ call: ${responseTime}ms for ${queueName}`,
          'RabbitMQ',
        );
      } else {
        Logger.log(`✅ RabbitMQ call: ${responseTime}ms for ${queueName}`, 'RabbitMQ');
      }

      return result;
    } catch (error) {
      Logger.error(`Send error [${queueOrPattern}]`, error.message, 'RabbitMQ');
      return null;
    }
  }

  private getTimeout(pattern: string): number {
    // All patterns use same timeout for simplicity
    return this.DEFAULT_TIMEOUT;
  }

  private waitForReply(replyQueue: string, correlationId: string, timeout: number): Promise<any> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.channel.deleteQueue(replyQueue).catch(() => {});
        Logger.warn(`Timeout waiting for reply: ${correlationId}`, 'RabbitMQ');
        resolve(null);
      }, timeout);

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
