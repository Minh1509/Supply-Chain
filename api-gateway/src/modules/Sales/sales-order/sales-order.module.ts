import { Module } from '@nestjs/common';
import { SalesOrderController } from './sales-order.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [SalesOrderController],
})
export class SalesOrderModule {}
