import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/entities';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { AwsS3Module } from '../shared/aws-s3';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), AwsS3Module],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
