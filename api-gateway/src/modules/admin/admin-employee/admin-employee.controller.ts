import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { SuccessResponseDto } from 'src/common/dto';
import { SwaggerApiDocument } from 'src/decorators';
import { Logger } from 'winston';
import { ADMIN_EMPLOYEE_CONSTANTS } from './admin-employee.constant';
import { EmployeeDto } from './dto/employee.dto';
import { EmployeeResponseDto } from './dto/response/employee-response.dto';

@Controller('admin/employees')
@ApiTags('Admin Employees')
@ApiBearerAuth()
export class AdminEmployeeController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.AUTH.name) private readonly authClient: ClientProxy,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @SwaggerApiDocument({
    operation: {
      summary: `[Admin] createEmployee`,
      operationId: `createEmployee`,
    },
    response: {
      status: HttpStatus.OK,
      type: EmployeeResponseDto,
    },
  })
  @Post()
  async create(@Body() body: EmployeeDto) {
    return await firstValueFrom(
      this.authClient.send(ADMIN_EMPLOYEE_CONSTANTS.CREATE, body),
    );
  }

  @SwaggerApiDocument({
    operation: {
      summary: `[Admin] deleteEmployee`,
      operationId: `deleteEmployee`,
    },
    response: {
      status: HttpStatus.OK,
      type: SuccessResponseDto,
    },
  })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.authClient.send(ADMIN_EMPLOYEE_CONSTANTS.DELETE, { id }),
    );
  }
}
