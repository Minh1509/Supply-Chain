import { Module } from '@nestjs/common';
import { ManufacturePlantController } from './manufacturePlant.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [ManufacturePlantController],
})
export class ManufacturePlantModule {}