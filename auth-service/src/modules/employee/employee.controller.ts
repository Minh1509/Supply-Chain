import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { EMPLOYEE_CONSTANTS } from './employee.constant';
import { EmployeeService } from './employee.service';

@Controller()
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @MessagePattern(EMPLOYEE_CONSTANTS.GET_BY_ID)
  async getById(@Payload() payload: { id: number }) {
    this.logger.debug('EmployeeController.getById', { payload });
    return this.employeeService.findById(payload.id);
  }

  @MessagePattern(EMPLOYEE_CONSTANTS.GET_BY_COMPANY)
  async getByCompany(@Payload() payload: { id: number }) {
    this.logger.debug('EmployeeController.getByCompany', { payload });
    return this.employeeService.findByCompanyId(payload.id);
  }

  @MessagePattern(EMPLOYEE_CONSTANTS.UPDATE)
  async update(@Payload() payload: { id: number; body: any }) {
    this.logger.debug('EmployeeController.update', { payload });
    return this.employeeService.update(payload.id, payload.body);
  }

  @MessagePattern(EMPLOYEE_CONSTANTS.UPDATE_AVATAR)
  async updateAvatar(@Payload() payload: { id: number; file: any }) {
    this.logger.debug('EmployeeController.updateAvatar', { payload });
    return await this.employeeService.updateAvatar(payload.id, payload.file);
  }
}
