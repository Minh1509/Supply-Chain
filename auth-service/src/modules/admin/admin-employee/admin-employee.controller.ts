import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ADMIN_EMPLOYEE_CONSTANTS } from './admin-employee.constant';
import { AdminEmployeeService } from './admin-employee.service';

@Controller()
export class AdminEmployeeController {
  constructor(
    private readonly adminEmployeeService: AdminEmployeeService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @MessagePattern(ADMIN_EMPLOYEE_CONSTANTS.CREATE)
  async create(@Payload() data: any) {
    this.logger.debug('AdminEmployeeController.create', { data });
    return this.adminEmployeeService.create(data);
  }

  @MessagePattern(ADMIN_EMPLOYEE_CONSTANTS.DELETE)
  async delete(@Payload() payload: { id: number }) {
    this.logger.debug('AdminEmployeeController.delete', { payload });
    return await this.adminEmployeeService.deleteById(payload.id);
  }
}
