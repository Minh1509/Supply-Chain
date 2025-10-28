import { Module } from '@nestjs/common';
import { RequestForQuotationController } from './request-for-quotation.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [RequestForQuotationController],
})
export class RequestForQuotationModule {}
