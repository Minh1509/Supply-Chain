import { Module } from '@nestjs/common';
import { AdminCompanyModule } from './admin-company/admin-company.module';
import { AdminEmployeeModule } from './admin-employee/admin-employee.module';

@Module({
  imports: [AdminCompanyModule, AdminEmployeeModule],
  controllers: [],
  providers: [],
})
export class AdminModule {}
