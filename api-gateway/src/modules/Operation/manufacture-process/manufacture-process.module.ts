import { Module } from '@nestjs/common';
import { ManufactureProcessController } from './manufacture-process.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [ManufactureProcessController],
})
export class ManufactureProcessModule {}
