import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

export class RabbitMQUtil {
  static async sendRequest(
    client: ClientProxy,
    pattern: string,
    data: any,
    timeoutMs: number = 30000,
  ): Promise<any> {
    return firstValueFrom(
      client
        .send(pattern, {
          pattern,
          data,
        })
        .pipe(
          timeout(timeoutMs),
          catchError(() => of(null)),
        ),
    );
  }
}

