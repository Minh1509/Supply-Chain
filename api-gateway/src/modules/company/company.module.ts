import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [CompanyController],
  providers: [],
})
export class CompanyModule {}
