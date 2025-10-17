import { Module } from '@nestjs/common';
import { WarehouseController } from './warehouse.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [WarehouseController],
})
export class WarehouseModule {}
