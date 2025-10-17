import { Module } from '@nestjs/common';
import { TransferTicketController } from './transfer-ticket.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [TransferTicketController],
})
export class TransferTicketModule {}
