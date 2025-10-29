import { Module } from '@nestjs/common';
import { DeliveryProcessController } from './delivery-process.controller';
import { RabbitmqModule } from 'src/modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [DeliveryProcessController],
})
export class DeliveryProcessModule {}