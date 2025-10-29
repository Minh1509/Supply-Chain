import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { ManufactureStageController } from './manufacture-stage.controller';
import { RabbitmqModule } from 'src/modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [ RabbitmqModule],
  controllers: [ManufactureStageController],
})
export class ManufactureStageModule {}