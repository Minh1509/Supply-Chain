import { Module } from '@nestjs/common';
import { IssueTicketController } from './issue-ticket.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [IssueTicketController],
})
export class IssueTicketModule {}
