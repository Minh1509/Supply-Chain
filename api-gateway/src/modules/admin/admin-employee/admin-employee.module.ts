import { Module } from '@nestjs/common';
import { RabbitmqModule } from 'src/modules/rabbitmq/rabbitmq.module';
import { AdminEmployeeController } from './admin-employee.controller';

@Module({
  imports: [RabbitmqModule],
  controllers: [AdminEmployeeController],
  providers: [],
})
export class AdminEmployeeModule {}
