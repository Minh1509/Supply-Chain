import { Module } from '@nestjs/common';
import { RabbitmqModule } from 'src/modules/rabbitmq/rabbitmq.module';
import { AdminCompanyController } from './admin-company.controller';

@Module({
  imports: [RabbitmqModule],
  controllers: [AdminCompanyController],
  providers: [],
})
export class AdminCompanyModule {}
