import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { COMPANY_CONSTANTS } from './company.constant';
import { CompanyService } from './company.service';

@Controller()
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @MessagePattern(COMPANY_CONSTANTS.FIND_ONE)
  async getCompanyById(@Payload() payload: { id: number }) {
    this.logger.debug('CompanyController.getCompanyById', { payload });
    return this.companyService.findById(payload.id);
  }

  @MessagePattern(COMPANY_CONSTANTS.FIND_ALL)
  async getAllCompanies(@Payload() payload: { page?: number; pageSize?: number }) {
    this.logger.debug('CompanyController.getAllCompanies', { payload });
    const { page = 1, pageSize = 10 } = payload;
    return this.companyService.findAll(page, pageSize);
  }
}
