import { Module } from '@nestjs/common';
// Update the import path if the file is located elsewhere, for example:
import { ItemController } from './item.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [ItemController],
})
export class ItemModule {}