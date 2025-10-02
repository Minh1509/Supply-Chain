import { Module } from '@nestjs/common';
import { ManufactureLineController } from './manufactureLine.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [ManufactureLineController],
})
export class ManufactureLineModule {}