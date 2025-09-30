import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { SwaggerApiDocument } from 'src/decorators';
import { Logger } from 'winston';
import { ADMIN_COMPANY_CONSTANTS } from './admin-company.constant';
import { CompanyDto } from './dto/company.dto';
import { CompanyResponseDto } from './dto/response/company-response.dto';
import { MonthlyCompanyReportResponseDto } from './dto/response/monthly-report-response.dto';

@Controller('admin/company')
@ApiTags('Admin Company')
@ApiBearerAuth()
export class AdminCompanyController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.AUTH.name) private readonly authClient: ClientProxy,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @SwaggerApiDocument({
    operation: {
      summary: `[Admin] adminUpdateCompany`,
      operationId: `adminUpdateCompany`,
    },
    response: {
      status: HttpStatus.OK,
      type: CompanyResponseDto,
    },
  })
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: CompanyDto) {
    return await firstValueFrom(
      this.authClient.send(ADMIN_COMPANY_CONSTANTS.UPDATE, { id, body }),
    );
  }

  @SwaggerApiDocument({
    operation: {
      summary: `[Admin] getMonthlyReport`,
      operationId: `getMonthlyReport`,
    },
    response: {
      status: HttpStatus.OK,
      type: [MonthlyCompanyReportResponseDto],
    },
  })
  @Get('monthly-report')
  async getMonthlyReport() {
    return await firstValueFrom(
      this.authClient.send(ADMIN_COMPANY_CONSTANTS.MONTHLY_REPORT, {}),
    );
  }
}
