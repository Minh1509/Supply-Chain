import { Module } from '@nestjs/common';
import { PurchaseOrderController } from './purchase-order.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [PurchaseOrderController],
})
export class PurchaseOrderModule {}
