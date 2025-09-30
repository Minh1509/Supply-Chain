import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department, Employee, User } from 'src/entities';
import { AdminEmployeeController } from './admin-employee.controller';
import { AdminEmployeeService } from './admin-employee.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Department, Employee])],
  controllers: [AdminEmployeeController],
  providers: [AdminEmployeeService],
})
export class AdminEmployeeModule {}
