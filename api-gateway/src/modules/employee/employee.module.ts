import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [EmployeeController],
  providers: [],
})
export class EmployeeModule {}
