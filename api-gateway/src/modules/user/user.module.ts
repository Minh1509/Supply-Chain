import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [UserController],
})
export class UserModule {}
