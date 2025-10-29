import { Module } from '@nestjs/common';
import { DeliveryOrderController } from './delivery-order.controller';
import { RabbitmqModule } from 'src/modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [DeliveryOrderController],
})
export class DeliveryOrderModule {}