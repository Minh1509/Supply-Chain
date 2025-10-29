import { Module } from '@nestjs/common';
import { ManufactureOrderController } from './manufacture-order.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [ManufactureOrderController],
})
export class ManufactureOrderModule {}
