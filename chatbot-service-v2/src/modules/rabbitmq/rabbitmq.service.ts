import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class RabbitmqService {
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  async send(pattern: string, data: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.client.send(pattern, data).pipe(timeout(5000)),
      );
    } catch (error) {
      console.error(`RabbitMQ send error [${pattern}]:`, error.message);
      throw error;
    }
  }

  emit(pattern: string, data: any): void {
    this.client.emit(pattern, data);
  }
}
