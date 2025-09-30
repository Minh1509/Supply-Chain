import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { DEPARTMENT_CONSTANTS } from './department.constant';
import { DepartmentService } from './department.service';

@Controller()
export class DepartmentController {
  constructor(
    private readonly departmentService: DepartmentService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @MessagePattern(DEPARTMENT_CONSTANTS.FIND_BY_ID)
  async findById(@Payload() payload: { id: number }) {
    this.logger.debug('DepartmentController.findById', { payload });
    return this.departmentService.findById(payload.id);
  }

  @MessagePattern(DEPARTMENT_CONSTANTS.FIND_BY_COMPANY)
  async findByCompanyId(@Payload() payload: { id: number }) {
    this.logger.debug('DepartmentController.findByCompanyId', { payload });
    return this.departmentService.findByCompanyId(payload.id);
  }
}
