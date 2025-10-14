import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ADMIN_COMPANY_CONSTANTS } from './admin-company.constant';
import { AdminCompanyService } from './admin-company.service';

@Controller()
export class AdminCompanyController {
  constructor(
    private readonly adminCompanyService: AdminCompanyService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @MessagePattern(ADMIN_COMPANY_CONSTANTS.UPDATE)
  async updateCompany(@Payload() payload: { id: number; body: any }) {
    this.logger.debug('AdminCompanyController.updateCompany', { payload });
    return this.adminCompanyService.update(payload.body, payload.id);
  }

  @MessagePattern(ADMIN_COMPANY_CONSTANTS.UPDATE_LOGO)
  async updateLogo(@Payload() payload: { id: number; file: any }) {
    this.logger.debug('AdminCompanyController.updateLogo', { payload });
    return this.adminCompanyService.updateLogo(payload.id, payload.file);
  }

  @MessagePattern(ADMIN_COMPANY_CONSTANTS.MONTHLY_REPORT)
  async getMonthlyCompanyReport() {
    this.logger.debug('AdminCompanyController.getMonthlyCompanyReport');
    return this.adminCompanyService.getMonthlyCompanyReport();
  }
}
