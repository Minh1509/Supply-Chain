import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { RequestForQuotationRequestDto } from './dto/request-for-quotation-request.dto';
import { UpdateStatusRequestDto } from './dto/update-status-request.dto';
import { REQUEST_FOR_QUOTATION_CONSTANTS } from './request-for-quotation.constant';

@Controller('request-for-quotations')
@ApiBearerAuth()
@ApiTags('Request For Quotation')
export class RequestForQuotationController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.BUSINESS.name) private businessClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create RFQ' })
  async createRFQ(@Body() request: RequestForQuotationRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(REQUEST_FOR_QUOTATION_CONSTANTS.CREATE, request),
    );
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all RFQs in company' })
  @ApiParam({ name: 'companyId', type: 'number', description: 'Company ID' })
  async getAllByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return await firstValueFrom(
      this.businessClient.send(REQUEST_FOR_QUOTATION_CONSTANTS.GET_ALL_IN_COMPANY, {
        companyId,
      }),
    );
  }

  @Get('request-company/:requestedCompanyId')
  @ApiOperation({ summary: 'Get all RFQs in requested company' })
  @ApiParam({
    name: 'requestedCompanyId',
    type: 'number',
    description: 'Requested Company ID',
  })
  async getAllByRequestedCompany(
    @Param('requestedCompanyId', ParseIntPipe) requestedCompanyId: number,
  ) {
    return await firstValueFrom(
      this.businessClient.send(
        REQUEST_FOR_QUOTATION_CONSTANTS.GET_ALL_BY_REQUESTED_COMPANY,
        {
          requestedCompanyId,
        },
      ),
    );
  }

  @Get(':rfqId')
  @ApiOperation({ summary: 'Get RFQ by ID' })
  @ApiParam({ name: 'rfqId', type: 'number', description: 'RFQ ID' })
  async getById(@Param('rfqId', ParseIntPipe) rfqId: number) {
    return await firstValueFrom(
      this.businessClient.send(REQUEST_FOR_QUOTATION_CONSTANTS.GET_BY_ID, { rfqId }),
    );
  }

  @Put(':rfqId/status')
  @ApiOperation({ summary: 'Update RFQ status' })
  @ApiParam({ name: 'rfqId', type: 'number', description: 'RFQ ID' })
  async updateStatus(
    @Param('rfqId', ParseIntPipe) rfqId: number,
    @Body() body: UpdateStatusRequestDto,
  ) {
    return await firstValueFrom(
      this.businessClient.send(REQUEST_FOR_QUOTATION_CONSTANTS.UPDATE_STATUS, {
        rfqId,
        body,
      }),
    );
  }
}
