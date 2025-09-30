import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/entities';
import { AwsS3Module } from 'src/modules/shared/aws-s3';
import { AdminCompanyController } from './admin-company.controller';
import { AdminCompanyService } from './admin-company.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company]), AwsS3Module],
  controllers: [AdminCompanyController],
  providers: [AdminCompanyService],
})
export class AdminCompanyModule {}
