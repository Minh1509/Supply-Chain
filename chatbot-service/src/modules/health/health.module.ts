import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { RagModule } from '../rag/rag.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RagModule, RabbitmqModule],
  controllers: [HealthController],
})
export class HealthModule {}
