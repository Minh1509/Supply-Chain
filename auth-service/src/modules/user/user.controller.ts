import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { USER_CONSTANTS } from './user.constant';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @MessagePattern(USER_CONSTANTS.CREATE)
  async create(@Payload() payload: any) {
    this.logger.debug('UserController.create', { payload });
    return this.userService.create(payload);
  }

  @MessagePattern(USER_CONSTANTS.GET_ALL)
  async findAll(@Payload() payload: any) {
    this.logger.debug('UserController.findAll', { payload });
    const { page, pageSize } = payload;
    return this.userService.findAll(page, pageSize);
  }

  @MessagePattern(USER_CONSTANTS.GET_BY_COMPANY)
  async findAllByCompanyId(@Payload() payload: { companyId: number }) {
    this.logger.debug('UserController.findAllByCompanyId', { payload });
    return this.userService.findAllByCompanyId(payload.companyId);
  }

  @MessagePattern(USER_CONSTANTS.GET_BY_EMPLOYEE)
  async findByEmployeeId(@Payload() payload: { employeeId: number }) {
    this.logger.debug('UserController.findByEmployeeId', { payload });
    return this.userService.findByEmployeeId(payload.employeeId);
  }

  @MessagePattern(USER_CONSTANTS.GET_BY_ID)
  async findById(@Payload() payload: { id: number }) {
    this.logger.debug('UserController.findById', { payload });
    return this.userService.findById(payload.id);
  }

  @MessagePattern(USER_CONSTANTS.UPDATE_INFO)
  async updateInfo(@Payload() payload: { userId: number; data: any }) {
    this.logger.debug('UserController.updateInfo', { payload });
    return this.userService.updateInfo(payload.userId, payload.data);
  }

  @MessagePattern(USER_CONSTANTS.UPDATE_PASSWORD)
  async updatePassword(@Payload() payload: { id: number; data: any }) {
    this.logger.debug('UserController.updatePassword', { payload });
    return this.userService.updatePassword(payload.id, payload.data);
  }

  @MessagePattern(USER_CONSTANTS.MONTHLY_REPORT)
  async getMonthlyReport() {
    this.logger.debug('UserController.getMonthlyReport');
    return this.userService.getMonthlyReport();
  }
}
