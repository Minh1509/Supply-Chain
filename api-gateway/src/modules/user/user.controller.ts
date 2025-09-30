import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { SaveResponseDto } from 'src/common/dto/save-response.dto';
import { SwaggerApiDocument } from 'src/decorators';
import { Logger } from 'winston';
import { FindAllUsersDto } from './dto/find-all.dto';
import { MonthlyUserReportResponseDto } from './dto/response/monthly-user-report-response.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserDto } from './dto/user.dto';
import { USER_CONSTANTS } from './user.constant';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.AUTH.name) private readonly userClient: ClientProxy,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @SwaggerApiDocument({
    operation: {
      summary: `createUser`,
      operationId: `createUser`,
    },
    response: {
      status: HttpStatus.OK,
      type: UserResponseDto,
    },
  })
  @Post()
  async create(@Body() body: UserDto) {
    return await firstValueFrom(this.userClient.send(USER_CONSTANTS.CREATE, body));
  }

  @SwaggerApiDocument({
    operation: {
      summary: `findAll`,
      operationId: `findAll`,
    },
    response: {
      status: HttpStatus.OK,
      type: [UserResponseDto],
    },
  })
  @Get()
  async findAll(@Query() query: FindAllUsersDto) {
    return await firstValueFrom(this.userClient.send(USER_CONSTANTS.GET_ALL, query));
  }

  @SwaggerApiDocument({
    operation: {
      summary: `findByCompanyId`,
      operationId: `findByCompanyId`,
    },
    response: {
      status: HttpStatus.OK,
      type: [UserResponseDto],
    },
  })
  @Get('company/:id')
  async findAllByCompanyId(@Param('id') companyId: number) {
    return await firstValueFrom(
      this.userClient.send(USER_CONSTANTS.GET_BY_COMPANY, { companyId }),
    );
  }

  @SwaggerApiDocument({
    operation: {
      summary: `findByEmloyeeId`,
      operationId: `findByEmloyeeId`,
    },
    response: {
      status: HttpStatus.OK,
      type: UserResponseDto,
    },
  })
  @Get('employee/:id')
  async findByEmployeeId(@Param('id') employeeId: number) {
    return await firstValueFrom(
      this.userClient.send(USER_CONSTANTS.GET_BY_EMPLOYEE, { employeeId }),
    );
  }

  @SwaggerApiDocument({
    operation: {
      summary: `getMonthlyReport`,
      operationId: `getMonthlyReport`,
    },
    response: {
      status: HttpStatus.OK,
      type: [MonthlyUserReportResponseDto],
    },
  })
  @Get('monthly-report')
  async getMonthlyReport() {
    return await firstValueFrom(this.userClient.send(USER_CONSTANTS.MONTHLY_REPORT, {}));
  }

  @SwaggerApiDocument({
    operation: {
      summary: `findOne`,
      operationId: `findOne`,
    },
    response: {
      status: HttpStatus.OK,
      type: UserResponseDto,
    },
  })
  @Get(':id')
  async findById(@Param('id') id: number) {
    return await firstValueFrom(this.userClient.send(USER_CONSTANTS.GET_BY_ID, { id }));
  }

  @SwaggerApiDocument({
    operation: {
      summary: `updateInfo`,
      operationId: `updateInfo`,
    },
    response: {
      status: HttpStatus.OK,
      type: UserResponseDto,
    },
  })
  @Patch('update-info/:id')
  async updateInfo(@Param('id') id: number, @Body() data: UpdateInfoDto) {
    return await firstValueFrom(
      this.userClient.send(USER_CONSTANTS.UPDATE_INFO, { id, data }),
    );
  }

  @SwaggerApiDocument({
    operation: {
      summary: `updatePassword`,
      operationId: `updatePassword`,
    },
    response: {
      status: HttpStatus.OK,
      type: SaveResponseDto,
    },
  })
  @Patch('update-password/:id')
  async updatePassword(@Param('id') id: number, @Body() data: UpdatePasswordDto) {
    return await firstValueFrom(
      this.userClient.send(USER_CONSTANTS.UPDATE_PASSWORD, { id, data }),
    );
  }
}
