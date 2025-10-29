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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { QuotationRequestDto } from './dto/quotation-request.dto';
import { QUOTATION_CONSTANTS } from './quotation.constant';

@Controller('quotations')
@ApiBearerAuth()
@ApiTags('Quotation')
export class QuotationController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.BUSINESS.name) private businessClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create quotation' })
  async createQuotation(@Body() request: QuotationRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(QUOTATION_CONSTANTS.CREATE, request),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quotation by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Quotation ID' })
  async getQuotationById(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.businessClient.send(QUOTATION_CONSTANTS.GET_BY_ID, { id }),
    );
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all quotations in company' })
  @ApiParam({ name: 'companyId', type: 'number', description: 'Company ID' })
  async getAllByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return await firstValueFrom(
      this.businessClient.send(QUOTATION_CONSTANTS.GET_ALL_IN_COMPANY, {
        companyId,
      }),
    );
  }

  @Get('rfq/:rfqId')
  @ApiOperation({ summary: 'Get quotation by RFQ' })
  @ApiParam({ name: 'rfqId', type: 'number', description: 'RFQ ID' })
  async getByRfq(@Param('rfqId', ParseIntPipe) rfqId: number) {
    return await firstValueFrom(
      this.businessClient.send(QUOTATION_CONSTANTS.GET_BY_RFQ_ID, { rfqId }),
    );
  }

  @Get('request-company/:requestCompanyId')
  @ApiOperation({ summary: 'Get all quotations by request company' })
  @ApiParam({ name: 'requestCompanyId', type: 'number', description: 'Request Company ID' })
  async getAllQuotationsByRequestCompany(
    @Param('requestCompanyId', ParseIntPipe) requestCompanyId: number,
  ) {
    return await firstValueFrom(
      this.businessClient.send(QUOTATION_CONSTANTS.GET_ALL_BY_REQUEST_COMPANY, {
        requestCompanyId,
      }),
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update quotation status' })
  @ApiParam({ name: 'id', type: 'number', description: 'Quotation ID' })
  @ApiQuery({ name: 'status', type: 'string', description: 'New status', required: true })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    return await firstValueFrom(
      this.businessClient.send(QUOTATION_CONSTANTS.UPDATE_STATUS, {
        id,
        status,
      }),
    );
  }
}
