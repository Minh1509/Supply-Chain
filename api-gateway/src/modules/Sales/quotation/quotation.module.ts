import { Module } from '@nestjs/common';
import { QuotationController } from './quotation.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [QuotationController],
})
export class QuotationModule {}
