import { Module } from '@nestjs/common';
import { BOMController } from './bom.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [BOMController],
})
export class BOMModule {}
