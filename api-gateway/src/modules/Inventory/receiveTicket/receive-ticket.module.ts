import { Module } from '@nestjs/common';
import { ReceiveTicketController } from './receive-ticket.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [ReceiveTicketController],
})
export class ReceiveTicketModule {}
