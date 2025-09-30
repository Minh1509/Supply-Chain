import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [DepartmentController],
  providers: [],
})
export class DepartmentModule {}
