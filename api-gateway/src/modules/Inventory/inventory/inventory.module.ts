import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [InventoryController],
})
export class InventoryModule {}
