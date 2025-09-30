import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthStrategy } from './strategies';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [AuthController],
  providers: [AuthStrategy],
  exports: [AuthStrategy],
})
export class AuthModule {}
