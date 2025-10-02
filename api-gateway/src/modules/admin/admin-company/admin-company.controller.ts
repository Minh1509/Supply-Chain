import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { UploadResponseDto } from 'src/common/dto/upload-response.dto';
import { SwaggerApiDocument } from 'src/decorators';
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

  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({
    summary: `[Admin] updateLogo`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UploadResponseDto,
  })
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await firstValueFrom(
      this.authClient.send(ADMIN_COMPANY_CONSTANTS.UPDATE_LOGO, { id, file }),
    );
  }
}
