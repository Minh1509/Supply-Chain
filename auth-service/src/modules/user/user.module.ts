import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee, User } from 'src/entities';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RabbitmqModule } from '../shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule, TypeOrmModule.forFeature([User, Employee])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
