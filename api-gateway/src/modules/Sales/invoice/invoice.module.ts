import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
